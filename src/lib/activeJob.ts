const ACTIVE_JOB_KEY = "active-transcode-job";

export function saveActiveJob(jobId: string) {
  localStorage.setItem(ACTIVE_JOB_KEY, jobId);
}

export function loadActiveJob(): string | null {
  return localStorage.getItem(ACTIVE_JOB_KEY);
}

export function clearActiveJob() {
  localStorage.removeItem(ACTIVE_JOB_KEY);
}
