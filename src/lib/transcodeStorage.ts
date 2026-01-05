import type { TranscodeState } from "./transcodeTypes";

const KEY_PREFIX = "transcodeStorage_";

export function saveProgress(jobId: string, progress: TranscodeState) {
  localStorage.setItem(
    KEY_PREFIX + jobId,
    JSON.stringify({ progress, ts: Date.now() })
  );
}

export function loadProgress(jobId: string): TranscodeState | null {
  const raw = localStorage.getItem(KEY_PREFIX + jobId);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed.progress ?? null;
  } catch {
    return null;
  }
}

export function clearProgress(jobId: string) {
  localStorage.removeItem(KEY_PREFIX + jobId);
}
