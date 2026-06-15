# 🎨 FLUX GEN — Advanced Multi-Channel AI Image Generation Hub

FLUX GEN is an enterprise-grade, highly responsive, full-stack visual studio powered by **NVIDIA NIM Generation APIs** and **Llama 3.3 Prompt Handlers**. Seamlessly bridging the gap between artistic imagination and photorealistic rendering, FLUX GEN hosts a sophisticated digital painting workflow both on a state-of-the-art client workspace and a high-concurrency **Telegram Bot** channel, supported by bulletproof local client storage and automatic API failure backdrops.

---

## 📸 Interactive Layout & Experience Map

Below is a block diagram illustrating FLUX GEN's workspace. Synthesized from modern off-black obsidian styling, the view presents a single-screen responsive panel engineered to optimize space and minimize noise.

```
+---------------------------------------------------------------------------------------------------------+
|  🎨 FLUX GEN  [Active: FLUX.1 Dev]                                                    ℹ️ Info  ⚙️ Config |
+---------------------------------------------------------------------------------------------------------+
|  📁 GENERATIONS     |  💬 ACTIVE STUDIO SPACE                                                           |
|                     |                                                                                   |
|  +---------------+  |  [User]: "Retro 1970s living room camera photo, polaroid style, volumetric lens"  |
|  |  New Studio   |  |                                                                                   |
|  +---------------+  |  🤖 [Prompt Optimizer: meta/llama-3.3-70b-instruct]                              |
|                     |  ↳ "Professional RAW photo, authentic film grain, ultra-realistic portrait,       |
|  - Cosplay Shoot    |     Kodak Portra, vintage warmth, shot on 35mm lens, sharp focus, masterpiece"    |
|  - Synth Background |                                                                                   |
|  - Retro Living     |  🎨 [Generating Image via black-forest-labs/flux.1-dev...]                       |
|  - Cyberpunk City   |  +-----------------------------------------------------------------------------+  |
|                     |  |                                                                             |  |
|                     |  |                          [ GENERATED MASTERPIECE ]                          |  |
|                     |  |                                                                             |  |
|                     |  +-----------------------------------------------------------------------------+  |
|                     |  [⬇️ Download JPG]   [📐 1280x768]                                 [⚙️ Seed: 25482] |
+---------------------+-----------------------------------------------------------------------------------+
| 📎 [Reference Img]  |  ✍️ Enter a prompt or describe a scenery...                         [⚡ Enhance] [▶]  |
+---------------------------------------------------------------------------------------------------------+
```

### 💎 Key Visual Panels
1. **Dynamic Left-Rail Drawer**: An expandable viewport capturing historic generation contexts. Includes an intuitive, zero-confirm pop-up modal to wipe records clean.
2. **Interactive Configuration Bar**: Features a responsive dropdown select-menu for active models, direct configuration triggers for active prompt enhancement, and creator metadata sheets.
3. **Visual Active Studio**: A flowing conversational feed tracking input requests, multimodal prompt intelligence, and progressive load states.
4. **Interactive Prompt Console**: Combines a multi-line auto-expanding text box, reference-image upload listeners, prompt optimization toggles, and cancellation triggers.

---

## ⚡ Core Architecture Capabilities

FLUX GEN implements premium features to provide low-latency performance and high reliability:

*   **🧠 Intelligent Prompt Optimizer (Llama 3.3 Instruct)**
    FLUX GEN automatically routes raw textual inputs to the `meta/llama-3.3-70b-instruct` engine via NVIDIA NIM. The prompt engineering pipeline transforms simple definitions into elaborate professional prompts containing camera profiles (`35mm lens`), color grades (`Kodak Portra warmth`), spatial metrics, and photographic guidelines (`8k resolution, ultra-realistic, sharp focus`).
*   **👁️ Multimodal Vision Assistance (Llama 3.2 Vision)**
    In image-to-image mode (supported on selected models such as `FLUX.1-Kontext-dev` and `Qwen-Image-Edit`), reference images are described using a background vision agent (`meta/llama-3.2-11b-vision-instruct`). The vision descriptor produces dense contextual guides that allow the generator to modify concepts with pixel-perfect fidelity.
*   **🛡️ Active Safety Fallbacks & Graceful Recovery**
    AI pipelines are prone to strict network timeouts or overprotective prompt filters. If NVIDIA returns a safety reject on optimized prompts, FLUX GEN automatically and silently falls back to your original source description, resolving the request without disrupting the generation flow.
*   **🔬 Universal Fallback Pipeline**
    If any primary target endpoint stalls or encounters rate limits, the system drops back to `black-forest-labs/flux.1-schnell` with a baseline 4-step generation layout on a guaranteed endpoint, preventing downtime.
*   **💾 Infinite Client Storage (idb-keyval)**
    Standard browser `localStorage` restricts payloads to 5MB, which will crash when trying to save complex base64 images or lengthy chat streams. FLUX GEN implements asynchronous key-value persistence on **IndexedDB**, supporting thousands of generation histories without data loss or UI freezes.
*   **📠 Dual-Channel Bot integration**
    FLUX GEN integrates a high-concurrency Telegram Bot channel that runs concurrently with your web application. Users can set models via inline keyboard callback selectors, submit descriptions, and receive beautiful markdown descriptions with their output photo in seconds.

---

## 🏗️ Data Flow & System Topology

The system uses a full-stack modular architecture, keeping development APIs hidden and routing requests safely behind server-side proxies:

```
                                  +-----------------------------+
                                  |     User Interface (Web)    |
                                  +--------------+--------------+
                                                 |
                                                 | (POST /api/generate)
                                                 v
+-----------------------+              +-----------------+             +--------------------------+
|  Telegram Messenger   +------------->+  Express Server +------------>+ NVIDIA NIM Endpoint API  |
|  (Inline Interaction) | (Webhooks)   | (Proxy Engine)  | (TLS JSON)  | - Llama 3.3 Promoter     |
|                       |              +--------+--------+             | - Llama 3.2 Descriptor   |
+-----------------------+                       |                      | - Black Forest FLUX      |
                                                |                      | - Stability SD 3.5 Large |
                                                v                      +--------------------------+
                                     +----------+----------+
                                     |  Local IndexedDB    |
                                     |  (Client-Side Caching)
                                     +---------------------+
```

---

## 🛠️ Supported Image Models & Specifications

Developers can choose from several text-to-image and image-to-image models directly through the UI:

| Model ID | Public Brand | Provider / Vendor | Class / Core Focus | Input Media Supported |
| :--- | :--- | :--- | :--- | :---: |
| `qwen-image` | Qwen Image | Alibaba Cloud | Text-to-Image baseline | Text Only |
| `qwen-image-edit` | Qwen Image Edit | Alibaba Cloud | Vision-guided modification | Text & Base64 Image |
| `flux.1-dev` | FLUX.1 Dev | Black Forest Labs | Photographic precision | Text Only |
| `flux.1-schnell` | FLUX.1 Schnell | Black Forest Labs | Lightning-fast generation | Text Only |
| `flux.1-kontext-dev` | FLUX.1 Kontext Dev | Black Forest Labs | In-context image synthesis | Text & Base64 Image |
| `flux.2-klein-4b` | FLUX.2 Klein 4B | NVIDIA AI | Cost-effective generation | Text Only |
| `stable-diffusion-3.5-large` | Stable Diffusion Large | Stability AI | Atmospheric lighting & composition | Text Only |

### 📐 Dynamic Aspect Ratio Matrix
The Prompt Optimizer dynamically resolves user requests into one of these five maximum-compatibility resolutions:

*   **1:1 Square**: `1024 x 1024` (Excellent for avatars, profile badges, and metadata)
*   **16:9 Landscape**: `1280 x 768` (Perfect for displays, YouTube thumbnails, and cinematic landscape graphics)
*   **9:16 Portrait**: `768 x 1280` (Optimized for mobile interfaces, TikTok screens, and stories)
*   **4:3 Classical**: `1152 x 896` (Ideal for publication art, printing frames, and grid portfolios)
*   **3:4 Editorial**: `896 x 1152` (Tailored for magazine print styling and vertical framing)

---

## ⚙️ Environment Configuration

Define these variables in your host environment or inside a local `.env` file:

```env
# NVIDIA NIM API Authentication (Mandatory)
NVIDIA_API_KEY=nvapi-your-nvidia-developer-key-here

# Telegram Bot Integration API Token (Optional)
# If supplied, the Express app automatically starts the Telegram Polling/Webhook interface
TELEGRAM_BOT_TOKEN=744926521...
```

---

## 📦 Local Installation & Setup

Execute these commands to clone the codebase and start your local workstation:

1.  **Clone the workspace and install standard dependencies**
    ```bash
    npm install
    ```

2.  **Spin up the integrated Full-Stack Development Server**
    ```bash
    npm run dev
    ```
    This initializes a server using `tsx` running on host `0.0.0.0` and port `3000`. The server mounts the backend routes and exposes the local Vite middleware for the client.

3.  **Compile & bundle for production**
    ```bash
    npm run build
    ```
    This compiles the web app using `vite build` (saving output in `dist/`) and bundles `server.ts` into a standalone, optimized ES/CJS CommonJS bundle inside `dist/server.cjs` using `esbuild`.

---

## 🚀 Cloud Run & Vercel Deployment

### 🐳 Google Cloud Run (Containerized)
The repository is fully configured for container hosting. The build-system maps the production startup command directly using:
```bash
npm run start
```
This runs the compiled node bundle: `node dist/server.cjs`, listening on all interfaces (`0.0.0.0`) on standard port `3000`.

### ⚡ Vercel serverless (Edge Execution)
The repository includes configuration to deploy to Vercel without a custom server. Vercel uses the configuration inside `vercel.json` and routes APIs down to our serverless endpoints under `/api`:

1. Import your project directory into your Vercel Dashboard.
2. Select the **Vite** project preset.
3. Add your environment variables (`NVIDIA_API_KEY`, `TELEGRAM_BOT_TOKEN`) in the Vercel Settings portal.
4. Let Vercel deploy! Routing is configured automatically via `/api/index.ts` and `/api/telegram.ts`.

---

## 📂 Codebase File Tree

The repository uses a modular structure to keep the codebase easy to maintain:

```
.
├── .env.example              # Template for API keys
├── .gitignore                # Untracked files and build assets
├── README.md                 # Technical documentation
├── index.html                # Vite SPA layout mountpoint
├── metadata.json             # App permissions and metadata specifications
├── package.json              # App manifests, scripts, and package indices
├── tsconfig.json             # Engine configuration rules for TypeScript
├── vercel.json               # Serverless Routing Rules for Vercel
├── vite.config.ts            # Client module resolution rules & CSS setups
├── server.ts                 # Full-stack dev entrypoint & Express/Telegram server
├── api/                      # Serverless api directory (Vercel)
│   ├── index.ts              # API proxy handler
│   └── telegram.ts           # Bot handler for webhooks
└── src/                      # Frontend client workspace
    ├── App.tsx               # Main application component
    ├── index.css             # Global tailwind styling definitions
    ├── main.tsx              # React mounting script
    ├── vite-env.d.ts         # Global asset type references
    └── assets/               # Local static images
```

---

## 👨‍💻 Created & Authored By

**Rehan Ahmad**  
Let's connect, collaborate, and build next-generation visual frameworks together!

*   **Email**: [rehan515ahmad@gmail.com](mailto:rehan515ahmad@gmail.com)
*   **LinkedIn**: [Rehan Ahmad](https://www.linkedin.com/in/rehan-ahmad-863386382?utm_source=share_via&utm_content=profile&utm_medium=member_android)
*   **GitHub**: [Ft976 Profiles](https://github.com/Ft976)
*   **Project Portfolio**: [Explore other Repositories](https://github.com/Ft976?tab=repositories)

---
*Created with digital craftsmanship. Have fun visualizing your thoughts in ultra-high resolution!*
