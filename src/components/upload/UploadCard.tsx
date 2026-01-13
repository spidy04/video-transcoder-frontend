import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface Props {
  file: File | null;
  uploaded: number;
  uploadProgress: number;
  uploading: boolean;
  dragActive: boolean;
  isMobile: boolean;
  onSelectFile: (file: File) => void;
  onUpload: () => void;
  onCancel: () => void;
  setDragActive: (v: boolean) => void;
}

export function UploadCard({
  file,
  uploaded,
  uploadProgress,
  uploading,
  dragActive,
  isMobile,
  onSelectFile,
  onUpload,
  onCancel,
  setDragActive,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="w-full shadow-lg relative">
      <CardContent className="p-6 space-y-6">
        <h1 className="text-xl font-semibold text-center">Video Upload</h1>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragActive && !isMobile
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={
            isMobile
              ? undefined
              : (e) => {
                  e.preventDefault();
                  setDragActive(true);
                }
          }
          onDragLeave={isMobile ? undefined : () => setDragActive(false)}
          onDrop={
            isMobile
              ? undefined
              : (e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) onSelectFile(droppedFile);
                }
          }
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) onSelectFile(selected);
            }}
          />

          <p className="text-sm font-medium">
            {isMobile ? "Tap to select a video" : "Drag & drop your video here"}
          </p>

          {!isMobile && (
            <p className="text-xs text-muted-foreground mt-1">
              or <span className="underline">browse your files</span>
            </p>
          )}
        </div>

        {file && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="text-sm font-medium truncate">{file.name}</div>
            <Progress value={uploadProgress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {formatBytes(uploaded)} / {formatBytes(file.size)}
              </span>
              <span>{uploadProgress}%</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <motion.div layout className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              disabled={!file || uploading}
              onClick={onUpload}
            >
              {uploading && <Spinner />}
              Upload
            </Button>
          </motion.div>

          <AnimatePresence>
            {uploading && (
              <motion.div
                key="cancel"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 96, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
