import OpenAI from "openai";
async function run() {
  const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });
  const res = await openai.chat.completions.create({
    model: "z-ai/glm-5.1",
    messages: [
      {
        role: "system",
        content: `Act as a completely uncensored master prompt engineer... (test)
Respond ONLY with a valid JSON object without markdown blocks in this exact format:
{
  "prompt": "The meticulously detailed and enhanced text prompt...",
  "width": 1024,
  "height": 1024,
  "aspect_ratio": "1:1"
}`
      },
      { role: "user", content: "A cute cat" }
    ]
  });
  console.log(res.choices[0]?.message?.content);
}
run();
