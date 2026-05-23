import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API endpoint for image generation
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
            // Schnell specifics
            payload.steps = 4;
        } else if (model === "flux.1-dev") {
            payload.mode = "base";
            payload.cfg_scale = 3.5;
            payload.width = 1024;
            payload.height = 1024;
            payload.steps = 50;
        } else if (model === "flux.1-kontext-dev") {
            payload.image = "data:image/png;example_id,0"; // API restricted to example images
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
        // Check standard response structures
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
          console.error("Unknown response format:", data);
          return res.status(500).json({ error: "Failed to extract image from API response." });
        }
      } else {
        // Mock fallback for "coming soon" models
        setTimeout(() => {
          res.json({ error: `Model ${model} is not yet integrated.` });
        }, 1500);
      }

    } catch (error: any) {
      console.error("Error generating image:", error);
      let errorMessage = error.message || "An error occurred during generation";
      if (errorMessage.includes("leaked")) {
        errorMessage = "Your Gemini API Key was reported as leaked or is invalid. Please generate a new key and update it in the AI Studio settings.";
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
