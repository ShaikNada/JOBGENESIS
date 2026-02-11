export async function fetchProblems() {
  const res = await fetch("http://localhost:4000/api/problems");

  if (!res.ok) {
    throw new Error("Failed to fetch problems");
  }

  return res.json();
}
