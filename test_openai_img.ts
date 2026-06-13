import fetch from "node-fetch";
async function run() {
  const models = [
    "black-forest-labs/flux.1-schnell",
    "black-forest-labs/flux.1-dev",
    "stabilityai/stable-diffusion-3.5-large",
    "alibaba/qwen-image"
  ];
  for (const m of models) {
    const res = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: m,
        prompt: "A cute cat",
        response_format: "b64_json"
      })
    });
    console.log(m, res.status);
    if (!res.ok) console.log(await res.text());
  }
}
run();
