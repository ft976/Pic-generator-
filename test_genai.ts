import fetch from "node-fetch";
async function run() {
  const models = [
    "black-forest-labs/flux.1-schnell",
    "stabilityai/stable-diffusion-3.5-large",
    "stabilityai/stable-diffusion-3-medium",
    "alibaba/qwen-image",
    "nvidia/sdxl"
  ];
  for (const m of models) {
    const res = await fetch(`https://ai.api.nvidia.com/v1/genai/${m}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text_prompts: [{"text": "A cute cat"}],
        prompt: "A cute cat"
      })
    });
    console.log(m, res.status);
    if (!res.ok) console.log(await res.text());
  }
}
run();
