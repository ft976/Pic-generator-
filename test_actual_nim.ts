import fetch from "node-fetch";

async function run() {
  const models = [
    "black-forest-labs/flux.1-schnell",
    "black-forest-labs/flux.1-dev",
    "stabilityai/stable-diffusion-3-medium",
    "stabilityai/stable-diffusion-3.5-large",
    "alibaba/qwen-image"
  ];
  for (const m of models) {
    const res = await fetch(`https://ai.api.nvidia.com/v1/genai/${m}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: "A cute cat" }) // Using just prompt to see if we get 422 or 200
    });
    console.log(m, res.status);
    if (!res.ok) console.log(await res.text());
  }
}
run();
