import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export interface ThreatAlert {
  level: string;
  title: string;
  message: string;
}

export async function getThreatAlerts(): Promise<ThreatAlert[]> {
  const response = await axios.get(
    `${API_URL}/analytics/threat-alerts`
  );

  return response.data;
}