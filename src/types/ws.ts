export type Resolution = "360p" | "480p" | "720p";

export type ProgressStatus = "queued" | "preparing" | "processing" | "done";

export type WSProgressMessage = {
  type: "progress";
  data: {
    jobId: string;
    resolution: Resolution;
    progress: number; // 0–100
    status: ProgressStatus;
    eta: number; // in seconds
  };
};

export type WSSubscribeMessage = {
  action: "subscribe";
  jobId: string;
};
