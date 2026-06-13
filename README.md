# 🎨 FLUX GEN - Advanced Multi-Channel AI Image Generation Hub

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NVIDIA](https://img.shields.io/badge/NVIDIA_NIM-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![ExpressJS](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

An enterprise-grade, highly responsive, full-stack visual composition platform powered by **FLUX.1 (Schnell, Dev, Kontext)** and **GLM-5.1 Prompt Enhancers via NVIDIA NIM**. 

FLUX GEN enables beautiful, conversational image generation both on a slick modern React UI and directly via a **Telegram Bot** channel, supported by resilient client storage and active safety fallback mechanisms.

---

## 📸 Page Layout & Experience

Below is a visual landscape of FLUX GEN's multi-pane conversational studio interface:

```
+---------------------------------------------------------------------------------------+
|  🎨 FLUX GEN  [Active: FLUX.1 Dev]                                    ℹ️ About  ⚙️ Config |
+---------------------------------------------------------------------------------------+
|  📁 SESSIONS      |  💬 ACTIVE CONVERSATION CONTEXT                                    |
|                   |                                                                   |
|  +-------------+  |  [User]: "Retro 1970s living room camera photo, polaroid style"   |
|  | New Studio  |  |                                                                   |
|  +-------------+  |  🤖 [Enhancing Prompt via GLM-5.1 Model...]                       |
|                   |  ↳ "Professional RAW photo, authentic film grain, warm Kodak       |
|  - Cosplay Shoot  |     Portra tones, faded chromatic colors, volumetric lens flare   |
|  - Synth Background|    shot on 35mm, highly detailed texture, nostalgic..."          |
|  - Retro Living   |                                                                   |
|  - Cyberpunk City |  🎨 [Generating Image using Selected FLUX Model...]               |
|                   |  +-------------------------------------------------------------+  |
|                   |  |                                                             |  |
|                   |  |                 [ GENERATED HIGH-FI IMAGE ]                 |  |
|                   |  |                                                             |  |
|                   |  +-------------------------------------------------------------+  |
|                   |  [⬇️ Download JPG]   [📐 1280x768]                     [⚙️ Seed: 4920] |
+-------------------+-------------------------------------------------------------------+
| 📎 [Reference]    |  ✍️ Enter a prompt or describe a scenery...         [⚡ Enhance] [▶]  |
+---------------------------------------------------------------------------------------+
```

---

## ⚡ Key Capabilities & Core Strengths

FLUX GEN elevates plain textual descriptions into production-ready photographics and realistic illustrations, leveraging full stack pipeline improvements:

*   **🧠 Intelligent Prompt Optimizer (GLM-5.1)**
    No more guessing complex camera lenses or stylistic keywords. When you send a prompt, a background LLM (`z-ai/glm-5.1` via NVIDIA NIM) parses your idea, identifies the context, recommends compatible layouts (such as 16:9, 4:3, or 1:1 square), and enriches it with cinematic lighting formulas.
*   **🛡️ Resilient Intelligent Safety fallbacks**
    Image generation filters can sometimes be overprotective. When an optimized prompt triggers a safety block, FLUX GEN automatically and silently falls back to your original base description, preventing unnecessary "blocked content" errors!
*   **📎 High-Fidelity Image-to-Image (Vision Guided)**
    Upload an reference image and supply a prompt. The server utilizes a multimodal descriptor (`gemini-2.5-flash`) to generate detailed guides, directing the downstream FLUX model to morph concepts with pixel-perfect intent.
*   **💾 High-Capacity Storage System (IndexedDB Proxy)**
    Never worry about standard browser `localStorage` quotas (typically restricted to 5MB, which easily crashes when keeping many rich image history sheets). FLUX GEN stores chat payloads, seeds, custom configurations, and generated base64 assets safely in **IndexedDB** using advanced asynchronous key-value mappings.
*   **📠 Multi-Channel Support (Telegram Bot + Web portal)**
    Run a full-featured Telegram bot in parallel. Select models straight from Telegram inline buttons, write prompts on-the-go, and receive base64-generated masterpieces directly in your chat screen with beautiful Markdown details.

---

## 🏗️ System Architecture & Data Flow

FLUX GEN implements a robust full-stack model to protect secrets, stream state changes, and avoid browser-side credential leaks.

```
                    +-------------------------------+
                    |     User Interface (Web)      |
                    +---------------+---------------+
                                    |
                                    | (JSON POST /api/generate)
                                    v
+------------------+  HTTP  +---------------+---------------+  NVIDIA API  +--------------------------+
|  Telegram Client +------->|     Express Backend Server    +------------->| NVIDIA NIM GenAI API     |
+------------------+        |  (API Handlers / BOT Engine)  |              | - FLUX.1 models          |
                            +---------------+---------------+              | - GLM-5.1 Optimizer      |
                                            |                              +--------------------------+
                                            | (Vision context checks)
                                            v
                                    +---------------+---------------+
                                    |     Gemini 2.5 Flash API      |
                                    |      (Image Descriptions)     |
                                    +-------------------------------+
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file or provide these variables in your hosting environment (e.g. Vercel, Cloud Run, Heroku):

```env
# NVIDIA NIM API Authentication (Mandatory)
NVIDIA_API_KEY=nvapi-your-nvidia-developer-nim-key-here

# Google Gemini API key (Required for Image-to-Image / Vision context)
GEMINI_API_KEY=AIzaSy...

# Telegram Bot Integration (Optional - Telegram Bot will start if supplied)
TELEGRAM_BOT_TOKEN=74492...
```

---

## 🚀 Installation & Local Development

Set up your workspace in just three simple commands:

1.  **Clone the repository & install dependencies**
    ```bash
    npm install
    ```

2.  **Initialize the Full-Stack Developer Ecosystem**
    ```bash
    npm run dev
    ```
    This sets up a unified, hot-reloading pipeline hosting both the frontend Vite workspace and the backend Node.js compiler scripts on port `3000`.

3.  **Compile & bundle for production**
    ```bash
    npm run build
    ```
    Creates a minified client package inside `/dist` and compiles a standalone, optimized ES/CJS bundle of `server.ts` to `/dist/server.cjs` for lightning-fast container cold starts on Google Cloud Run or AWS.

---

## 🪵 Supported Resolutions Matrix

The Prompt Enhancement Engine is fine-tuned to automatically negotiate and supply these exact, maximum-compatibility high-dimension resolution pairs depending on your intent:

| Aspect Ratio | Dimensions | Suggested Use Case |
| :---: | :---: | :--- |
| **1:1** | `1024 x 1024` | Social posts, profile avatars, icons |
| **16:9** | `1280 x 768` | Cinematic landscapes, standard monitors, YouTube banners |
| **9:16** | `768 x 1280` | Smartphone wallpaper, Instagram stories, TikTok screens |
| **4:3** | `1152 x 896` | Classical photography prints, bento grid illustrations |
| **3:4** | `896 x 1152` | Editorial style, magazine covers, vertical portraits |

---

## ☁️ Continuous Serverless Deployment

### Deploying to Cloud Run (Containerized)
The production start command resolves directly inside Node.js:
```json
"start": "node dist/server.cjs"
```
Ensure your server hooks up on host `0.0.0.0` and port `3000` (which is already configured in `server.ts`), enabling seamless container orchestration.

### Deploying to Vercel (Serverless Functions)
Deploy with single command using any standard Vercel environment:
*   Configure the deployment to use the **Vite project preset**.
*   Vercel reads the root `vercel.json` file to route endpoints cleanly to the serverless server under `/api/index.ts`.
*   Ensure the `NVIDIA_API_KEY` and `GEMINI_API_KEY` variables are specified in your **Vercel Project Settings -> Environment Variables** panel.

---

## 🎓 Technology Stack & Highlights

*   **Vite 6 / React 18 / TypeScript** - Fully responsive, low-latency client-side engine.
*   **idb-keyval** - IndexedDB wrapper to bypass standard LocalStorage limit failures.
*   **Tailwind CSS 4** - Beautiful dark obsidian design system with responsive sidebar rails and custom backdrops.
*   **Lucide Icons** - Modern, crisp svg vector symbols.
*   **Express Router** - High-concurrency backend layer with integrated Telegram bot polling hooks.

---

## 👨‍💻 Created & Authored By

**Rehan Ahmad**
*   **Email:** [rehan515ahmad@gmail.com](mailto:rehan515ahmad@gmail.com)
*   **LinkedIn:** [Rehan Ahmad](https://www.linkedin.com/in/rehan-ahmad-863386382)
*   **GitHub:** [Ft976 Profiles](https://github.com/Ft976)
*   **Projects Workspace:** [Explore more repositories](https://github.com/Ft976?tab=repositories)

---
*Developed with meticulous digital craftsmanship. Enjoy creating high-end imagery with FLUX GEN!*
