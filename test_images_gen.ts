import fetch from "node-fetch";
async function run() {
  const models = [
    "stabilityai/stable-diffusion-3.5-large",
    "black-forest-labs/flux.1-schnell"
  ];
  for (const m of models) {
    const res = await fetch(`https://ai.api.nvidia.com/v1/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: m,
        prompt: "a cat"
      })
    });
    console.log(m, res.status);
    if (!res.ok) console.log(await res.text());
  }
}
run();
