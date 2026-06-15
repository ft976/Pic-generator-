import fetch from "node-fetch";

async function run() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` }
  });
  const data: any = await res.json();
  console.log(data.data.map((m: any) => m.id).filter((id: string) => id.includes("qwen") || id.includes("flux") || id.includes("diffusion") || id.includes("image") || id.includes("sd")));
}

run();
