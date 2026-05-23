import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, model, inputImage } = req.body;
    
    if (model.includes("flux")) {
      if (!process.env.NVIDIA_API_KEY) {
        return res.status(500).json({ error: "NVIDIA_API_KEY is not configured" });
      }
      
      const vendor = "black-forest-labs";
      const invokeUrl = `https://ai.api.nvidia.com/v1/genai/${vendor}/${model}`;
      const headers = {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
      };
      
      const payload: any = {
        prompt: prompt,
        seed: 0,
      };

      if (model === "flux.2-klein-4b") {
          payload.width = 1024;
          payload.height = 1024;
          payload.steps = 4;
      } else if (model === "flux.1-schnell") {
          payload.steps = 4;
      } else if (model === "flux.1-dev") {
          payload.mode = "base";
          payload.cfg_scale = 3.5;
          payload.width = 1024;
          payload.height = 1024;
          payload.steps = 50;
      } else if (model === "flux.1-kontext-dev") {
          payload.image = "data:image/png;example_id,0";
          payload.aspect_ratio = "match_input_image";
          payload.steps = 30;
          payload.cfg_scale = 3.5;
      }

      const response = await fetch(invokeUrl, {
          method: "post",
          body: JSON.stringify(payload),
          headers: headers
      });

      if (response.status !== 200) {
        const errBody = await response.text();
        return res.status(500).json({ error: `NVIDIA API Error: ${response.status} ${errBody}` });
      }

      const data: any = await response.json();
      
      let base64Str = "";
      if (data.image) {
         base64Str = data.image;
      } else if (data.data && data.data[0] && data.data[0].b64_json) {
         base64Str = data.data[0].b64_json;
      } else if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
         base64Str = data.artifacts[0].base64;
      }

      if (base64Str) {
        const imageUrl = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;
        return res.json({ imageUrl });
      } else {
        return res.status(500).json({ error: "Failed to extract image from API response." });
      }
    } else {
      setTimeout(() => {
        res.json({ error: `Model ${model} is not yet integrated.` });
      }, 1500);
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    let errorMessage = error.message || "An error occurred during generation";
    if (errorMessage.includes("leaked")) {
      errorMessage = "Your API Key was reported as leaked or is invalid.";
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default app;
