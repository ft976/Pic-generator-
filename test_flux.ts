import fetch from "node-fetch";
async function run() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` }
  });
  const data = await res.json();
  const res2 = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method:"GET",
    headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` }
  });
  console.log("TEST!");
}
run();
