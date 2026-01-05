import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../ui/spinner";
import { formatSeconds } from "@/lib/formatSeconds";
import type { TranscodeProgress } from "@/lib/transcodeTypes";

const resolutions = [
  { label: "360p", key: "360p" },
  { label: "480p", key: "480p" },
  { label: "720p", key: "720p" },
];

interface Props {
  progress: Record<string, TranscodeProgress>;
  onUploadAnother: () => void;
}

export function TranscodeProgressCard({ progress, onUploadAnother }: Props) {
  const allDone = resolutions.every((r) => progress[r.key]?.status === "done");

  const isTranscoding = resolutions.some((r) => {
    const status = progress[r.key]?.status;
    return status && status !== "done";
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ ease: "easeOut", duration: 0.35 }}
      className="relative w-105"
    >
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Transcoding</h2>
            {isTranscoding && <Spinner className="text-muted-foreground" />}
          </div>

          {resolutions.map((r) => {
            const item = progress[r.key];

            return (
              <div key={r.key} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.label}</span>
                  {item?.status === "done" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>

                <Progress
                  value={item?.progress ?? 0}
                  className={item?.status === "done" ? "opacity-60" : ""}
                />

                <div className="text-xs text-muted-foreground">
                  {item?.status === "queued" && "Queued"}
                  {item?.status === "preparing" && "Preparing"}
                  {item?.status === "processing" && (
                    <>
                      Processing • {item.progress}%
                      {item.eta > 0 && (
                        <span className="ml-2">
                          • ETA ~ {formatSeconds(item.eta)}
                        </span>
                      )}
                    </>
                  )}
                  {item?.status === "done" && "Completed"}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
          >
            <div className="text-center space-y-3">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">All resolutions are ready</p>
              <div className="text-sm text-muted-foreground">
                Upload another video?
              </div>
              <Button onClick={onUploadAnother}>Upload</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
