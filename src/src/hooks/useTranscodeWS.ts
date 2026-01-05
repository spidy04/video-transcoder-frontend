import { useEffect, useRef } from "react";
import type { WSProgressMessage } from "@/types/ws";
import { saveProgress } from "@/lib/transcodeStorage";
import type { TranscodeState } from "@/lib/transcodeTypes";
import { WS_URL } from "@/lib/config";
import { toast } from "sonner";

export function useTranscodeWS(
  jobId: string | null,
  setProgress: React.Dispatch<React.SetStateAction<TranscodeState>>,
  isCancellingRef: React.RefObject<boolean>
) {
  const wsRef = useRef<WebSocket | null>(null);
  const isUnmountedRef = useRef(false);
  const jobActiveRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = { ...prev };

        (Object.keys(next) as (keyof TranscodeState)[]).forEach((key) => {
          const item = next[key];
          if (item?.status === "processing" && item.eta > 0) {
            next[key] = {
              ...item,
              eta: Math.max(0, item.eta - 1),
            };
          }
        });

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setProgress]);

  useEffect(() => {
    if (!jobId) return;

    jobActiveRef.current = true;
    isUnmountedRef.current = false;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "subscribe", jobId }));
    };

    ws.onmessage = (event) => {
      const msg: WSProgressMessage = JSON.parse(event.data);

      if (msg.type !== "progress") return;

      const { resolution, progress, status, eta } = msg.data;

      setProgress((prev) => {
        const updated: TranscodeState = {
          ...prev,
          [resolution]: {
            ...prev[resolution],
            progress,
            status,
            eta,
          },
        };

        saveProgress(jobId, updated);

        const allDone = Object.values(updated).every(
          (r) => r.status === "done"
        );

        if (allDone) {
          jobActiveRef.current = false;
        }

        return updated;
      });
    };

    ws.onerror = () => {
      if (!isUnmountedRef.current && jobActiveRef.current) {
        toast.warning("Live updates temporarily unavailable.");
      }
    };

    ws.onclose = () => {
      if (isUnmountedRef.current) return;
      if (!jobActiveRef.current) return;
      if (isCancellingRef.current) return;

      toast.info("Connection lost. Waiting for updates…");
    };

    return () => {
      isUnmountedRef.current = true;
      jobActiveRef.current = false;
      ws.close();
      wsRef.current = null;
    };
  }, [jobId, setProgress]);
}
