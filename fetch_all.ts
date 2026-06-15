import fetch from "node-fetch";
import fs from "fs";
async function run() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}` }
  });
  const data: any = await res.json();
  const models = data.data.map((m: any) => m.id);
  fs.writeFileSync("models.txt", models.join("\n"));
}
run();
