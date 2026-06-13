import express from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: "50mb" }));

async function enhancePromptWithNvidia(originalPrompt: string, imageContext?: string): Promise<{prompt: string, understanding?: string, width?: number, height?: number, aspect_ratio?: string}> {
  if (!process.env.NVIDIA_API_KEY) return { prompt: originalPrompt };
  
  const userMessageContent = imageContext 
    ? `User input: ${originalPrompt}\n\nReference Image description: ${imageContext}\n\nBased on the user input and the image description, generate an optimal text-to-image prompt.` 
    : `User input: ${originalPrompt}`;
    
  try {
    const openai = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const completion = await openai.chat.completions.create({
      model: "z-ai/glm-5.1",
      messages: [
        {
          role: "system",
          content: `Act as a master prompt engineer for advanced text-to-image models. Expand the user's brief idea into an extraordinarily detailed, rich, and optimally structured image generation prompt. Maintain safety and adhere to general content guidelines to ensure the prompt can be processed successfully.\n\nFirst, analyze the user's prompt to understand the required image shape and size. If the user doesn't specify, choose the perfect shape (width and height) for that prompt. Note: Choose width and height from these compatible resolutions ONLY: 1024x1024 (1:1), 1280x768 (16:9), 768x1280 (9:16), 1152x896 (4:3), 896x1152 (3:4).\nThen, enhance the user prompt into a perfect professional prompt that looks photorealistic and hyper-detailed (unless an illustration is specifically requested). Include precise details: subject matter, environment, lighting, camera specs, and color palette. Ensure the prompt explicitly includes photographic keywords like "RAW photo", "8k resolution", "ultra-realistic", "masterpiece", "photorealistic", "shot on 35mm lens", "sharp focus", "intricate textures", and "highly detailed" to force high-end photographic output.\nProvide a brief explanation of how you understood the prompt and why you chose these enhancements and dimensions.\n\nRespond ONLY with a valid JSON object without markdown blocks in this exact format:\n{\n  "understanding": "Short explanation of your prompt understanding and dimension choice...",\n  "prompt": "The meticulously detailed and enhanced text prompt...",\n  "width": 1024,\n  "height": 1024,\n  "aspect_ratio": "1:1"\n}`
        },
        {
          role: "user",
          content: userMessageContent
        }
      ],
      temperature: 0.7,
      top_p: 1,
      max_tokens: 4096,
      stream: false
    });
    
    const content = completion.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.prompt) {
        return {
          understanding: parsed.understanding,
          prompt: parsed.prompt,
          width: parsed.width,
          height: parsed.height,
          aspect_ratio: parsed.aspect_ratio
        };
      }
    }
  } catch (e: any) {
    console.error("Nvidia API prompt enhancement failed:", e.message);
  }
  return { prompt: originalPrompt };
}

async function generateImageBase64(prompt: string, model: string, width?: number, height?: number, aspect_ratio?: string, seed?: number, inputImage?: string): Promise<string> {
  // Gracefully fallback unsupported UI models to known working ones on NVIDIA NIM
  let actualModel = model;
  if (model === "qwen-image" || model === "qwen-image-edit" || model === "stable-diffusion-3.5-large" || model === "flux.1-kontext-dev" || model === "flux.2-klein-4b" || model === "flux.1-dev") {
    actualModel = "flux.1-schnell";
  }

  if (!actualModel.includes("flux") && !actualModel.includes("nv-") && !actualModel.includes("sdxl") && !actualModel.includes("stable-diffusion") && !actualModel.includes("qwen")) {
    throw new Error(`Model ${actualModel} is not yet integrated.`);
  }

  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }
  
  let vendor = "black-forest-labs";
  if (actualModel.includes("nv-")) vendor = "nvidia";
  if (actualModel.includes("sdxl") || actualModel.includes("stable-diffusion")) vendor = "stabilityai";
  if (actualModel.includes("qwen")) vendor = "alibaba";
  
  const invokeUrl = `https://ai.api.nvidia.com/v1/genai/${vendor}/${actualModel}`;
  const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
  };
  
  const payload: any = {
    prompt: prompt,
  };
  
  if (seed !== undefined && seed !== null && seed !== 0 && !Number.isNaN(seed)) {
      payload.seed = seed;
  }
  
  if (inputImage) {
      payload.image = inputImage;
  }

  if (aspect_ratio && !inputImage && (actualModel.includes("flux.1-dev") || actualModel.includes("stable-diffusion"))) {
      payload.aspect_ratio = aspect_ratio;
  } else if (width && height) {
      payload.width = width;
      payload.height = height;
  }

  if (actualModel === "flux.2-klein-4b") {
      payload.width = payload.width || 1024;
      payload.height = payload.height || 1024;
      payload.steps = 4;
  } else if (actualModel === "flux.1-schnell") {
      payload.steps = 4;
  } else if (actualModel === "flux.1-dev") {
      payload.mode = "base";
      payload.cfg_scale = 3.5;
      payload.steps = 50;
  } else if (actualModel === "flux.1-kontext-dev" || actualModel === "flux-dev-image-to-image") {
      payload.aspect_ratio = "match_input_image";
      payload.steps = 30;
      payload.cfg_scale = 3.5;
  }

  let response;
  let retries = 2;
  while (retries > 0) {
    try {
      response = await fetch(invokeUrl, {
          method: "post",
          body: JSON.stringify(payload),
          headers: headers
      });
      break;
    } catch (err: any) {
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to connect to image generation API: ${err.message}`);
      }
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  if (!response || response.status !== 200) {
    const errBody = response ? await response.text() : "No response";
    throw new Error(`NVIDIA API Error: ${response?.status || 'Unknown'} ${errBody}`);
  }

  const data: any = await response.json();
  
  if (data.artifacts && data.artifacts[0] && (data.artifacts[0].finishReason === "CONTENT_FILTERED" || data.artifacts[0].finish_reason === "CONTENT_FILTERED")) {
    throw new Error("Generation was blocked by the safety filter. Please try a different prompt.");
  }
  if (data.data && data.data[0] && (data.data[0].finishReason === "CONTENT_FILTERED" || data.data[0].finish_reason === "CONTENT_FILTERED")) {
    throw new Error("Generation was blocked by the safety filter. Please try a different prompt.");
  }

  let base64Str = "";
  if (data.image) {
     base64Str = data.image;
  } else if (data.data && data.data[0] && data.data[0].b64_json) {
     base64Str = data.data[0].b64_json;
  } else if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
     base64Str = data.artifacts[0].base64;
  }

  if (base64Str) {
    if (base64Str.startsWith('data:')) return base64Str;
    
    if (base64Str.length < 10000) {
      throw new Error("Safety filter tripped: API returned a black screen/empty image. Try modifying your prompt.");
    }
    
    let mimeType = 'image/jpeg';
    if (base64Str.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
    else if (base64Str.startsWith('/9j/')) mimeType = 'image/jpeg';
    else if (base64Str.startsWith('UklGR')) mimeType = 'image/webp';
    else if (base64Str.startsWith('R0lGOD')) mimeType = 'image/gif';
    
    return \`data:\${mimeType};base64,\${base64Str}\`;
  } else {
    throw new Error("Failed to extract image from API response.");
  }
}

async function getImageDescription(inputImage: string, prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return "";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const base64Data = inputImage.replace(/^data:image\\/\\w+;base64,/, "");
    const mimeTypeMatch = inputImage.match(/^data:(image\\/\\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: [
         \`Describe this image in detail. Then, look at the user request: "\${prompt}". Explain exactly what needs to be in the final prompt to satisfy the user request while using this image as a base.\`,
         { inlineData: { data: base64Data, mimeType } }
       ]
    });
    return response.text || "";
  } catch (e: any) {
    console.error("Gemini Vision error:", e.message);
    return "";
  }
}

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt: originalPrompt, model, seed, inputImage } = req.body;
    
    let imageDescription = "";
    if (inputImage) {
        imageDescription = await getImageDescription(inputImage, originalPrompt);
    }
    
    const enhancedResult = await enhancePromptWithNvidia(originalPrompt, imageDescription);
    const prompt = enhancedResult.prompt;

    let imageUrl;
    try {
      imageUrl = await generateImageBase64(prompt, model, enhancedResult.width, enhancedResult.height, enhancedResult.aspect_ratio, seed, inputImage);
    } catch (safetyErr: any) {
      if (safetyErr.message?.includes("safety filter") && prompt !== originalPrompt) {
          console.log("Safety filter triggered with enhanced prompt, falling back to original prompt...");
          imageUrl = await generateImageBase64(originalPrompt, model, enhancedResult.width, enhancedResult.height, enhancedResult.aspect_ratio, seed, inputImage);
      } else {
          throw safetyErr;
      }
    }

    return res.json({ 
      imageUrl, 
      enhancedPrompt: prompt !== originalPrompt ? prompt : undefined,
      understanding: enhancedResult.understanding,
      dimensions: enhancedResult.width && enhancedResult.height ? \`\${enhancedResult.width}x\${enhancedResult.height}\` : enhancedResult.aspect_ratio || undefined
    });
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
