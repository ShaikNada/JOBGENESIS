import { API_URL } from '../../config';
export const getStandardProblems = async () => {
  const res = await fetch(`${API_URL}/api/problems`);

  if (!res.ok) {
    throw new Error("Failed to fetch problems");
  }

  return res.json();
}
