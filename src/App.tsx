import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { UploadCard } from "@/components/upload/UploadCard";
import { TranscodeProgressCard } from "@/components/transcode/TranscodeProgressCard";
import { StackedCard } from "@/components/layout/StackedCard";
import { useTranscodeWS } from "@/src/hooks/useTranscodeWS";
import { clearProgress } from "@/lib/transcodeStorage";
import type { TranscodeState } from "@/lib/transcodeTypes";
import { clearActiveJob, loadActiveJob, saveActiveJob } from "@/lib/activeJob";
import { fetchJobStatus } from "@/lib/transcodeApi";
import { API_BASE_URL } from "@/lib/config";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type ActiveCard = "upload" | "transcode";

const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad/i.test(navigator.userAgent);

const INITIAL_TRANSCODE_STATE: TranscodeState = {
  "360p": { resolution: "360p", progress: 0, status: "queued", eta: 0 },
  "480p": { resolution: "480p", progress: 0, status: "queued", eta: 0 },
  "720p": { resolution: "720p", progress: 0, status: "queued", eta: 0 },
};

export default function VideoUploadPage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancellingRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploaded, setUploaded] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [activeCard, setActiveCard] = useState<ActiveCard>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [transcodeProgress, setTranscodeProgress] = useState<TranscodeState>(
    INITIAL_TRANSCODE_STATE
  );

  useTranscodeWS(jobId, setTranscodeProgress, isCancellingRef);

  const selectFile = (file: File) => {
    setFile(file);
    setUploadProgress(0);
    setUploaded(0);

    setTranscodeProgress(INITIAL_TRANSCODE_STATE);
  };

  useEffect(() => {
    const restore = async () => {
      const existingJobId = loadActiveJob();

      if (!existingJobId) {
        setIsHydrated(true);
        return;
      }

      try {
        const job = await fetchJobStatus(existingJobId);

        if (job?.completedAt) {
          clearActiveJob();
          clearProgress(existingJobId);
          setJobId(null);
          setActiveCard("upload");
          return;
        }

        if (job?.resolutions) {
          setJobId(existingJobId);
          setTranscodeProgress(job.resolutions);
          setActiveCard("transcode");
          return;
        }

        clearActiveJob();
        clearProgress(existingJobId);
      } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          clearActiveJob();
          clearProgress(existingJobId);
          setJobId(null);
          setActiveCard("upload");
          return;
        }

        toast.error("Failed to restore previous job.");
        clearActiveJob();
        clearProgress(existingJobId);
      } finally {
        setIsHydrated(true);
      }
    };

    restore();
  }, []);

  async function handleUpload() {
    if (!file) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setUploading(true);

      const presignRes = await axios.post(`${API_BASE_URL}/api/upload`, {
        filename: file.name,
        contentType: file.type,
      });

      const { uploadUrl, jobId: newJobId } = presignRes.data;

      setJobId(newJobId);
      saveActiveJob(newJobId);

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        signal: controller.signal,
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploaded(event.loaded);
            setUploadProgress(percent);
          }
        },
      });

      setTranscodeProgress({
        "360p": {
          resolution: "360p",
          progress: 0,
          status: "preparing",
          eta: 0,
        },
        "480p": {
          resolution: "480p",
          progress: 0,
          status: "preparing",
          eta: 0,
        },
        "720p": {
          resolution: "720p",
          progress: 0,
          status: "preparing",
          eta: 0,
        },
      });

      setActiveCard("transcode");
    } catch (error: any) {
      if (
        axios.isAxiosError(error) &&
        (error.code === "ERR_CANCELED" || error.name === "CanceledError")
      ) {
        return;
      }

      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Upload failed. Please try again."
          : "Unexpected error during upload."
      );
    } finally {
      setUploading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }

  function cancelUpload() {
    isCancellingRef.current = true;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (jobId) {
      clearProgress(jobId);
      clearActiveJob();
    }

    setJobId(null);
    setUploading(false);
    setUploadProgress(0);
    setUploaded(0);
    toast.info("Upload cancelled");

    isCancellingRef.current = false;
  }

  const resetAll = () => {
    if (jobId) {
      clearProgress(jobId);
      clearActiveJob();
    }

    setFile(null);
    setUploaded(0);
    setUploadProgress(0);
    setJobId(null);
    setTranscodeProgress(INITIAL_TRANSCODE_STATE);
    setFileInputKey((prev) => prev + 1);
    setActiveCard("upload");
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted px-4 sm:px-0">
      <Toaster />

      <div className=" relative w-full max-w-md sm:max-w-lg md:max-w-lg lg:w-105 min-h-[420px] mx-auto">
        <StackedCard active={activeCard === "upload"}>
          <UploadCard
            key={fileInputKey}
            file={file}
            uploaded={uploaded}
            uploadProgress={uploadProgress}
            uploading={uploading}
            dragActive={dragActive}
            isMobile={isMobile}
            setDragActive={setDragActive}
            onSelectFile={selectFile}
            onUpload={handleUpload}
            onCancel={cancelUpload}
          />
        </StackedCard>

        <StackedCard active={activeCard === "transcode"}>
          <TranscodeProgressCard
            progress={transcodeProgress}
            onUploadAnother={resetAll}
          />
        </StackedCard>
      </div>
    </div>
  );
}
