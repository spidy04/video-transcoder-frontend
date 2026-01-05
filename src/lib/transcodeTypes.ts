export const Resolutions = ["360p", "480p", "720p"];
export type Resolution = (typeof Resolutions)[number];

export type ResolutionStatus = "queued" | "preparing" | "processing" | "done";

export type TranscodeProgress = {
  resolution: string;
  progress: number;
  status: ResolutionStatus;
  eta: number;
};

export type TranscodeState = Record<Resolution, TranscodeProgress>;
