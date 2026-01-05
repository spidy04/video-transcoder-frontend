import axios from "axios";
import { API_BASE_URL } from "./config";

export async function fetchJobStatus(jobId: string) {
  const res = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}/status`);
  return res.data;
}
