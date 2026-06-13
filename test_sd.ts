import fetch from "node-fetch";

async function run() {
  const models = [
    "stabilityai/stable-diffusion-3-medium",
    "stabilityai/sdxl-turbo",
    "stabilityai/stable-diffusion-xl"
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
        seed: 0
      })
    });
    console.log(m, res.status, await res.text());
  }
}
run();
