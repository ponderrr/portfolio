<div align="center">

<h1>Andrew Ponder — Portfolio</h1>

<p>
  Production-grade <strong>Vite + React + TypeScript</strong> portfolio featuring <strong>EXHIBIT 001</strong>: a GPU-accelerated
  <strong>neural-lattice</strong> visualization driven by deterministic MLP weights and a real-time Three.js simulation loop.
</p>

<br/>

<img alt="Vite" src="https://img.shields.io/badge/Vite-5-8B5CF6?style=for-the-badge&logo=vite&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React-18-00D9FF?style=for-the-badge&logo=react&logoColor=0B0B0B" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img alt="Three.js" src="https://img.shields.io/badge/Three.js-0.181-111111?style=for-the-badge&logo=three.js&logoColor=white" />
<br/>
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-00D9FF?style=for-the-badge&logo=tailwindcss&logoColor=0B0B0B" />
<img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-11-FF006E?style=for-the-badge&logo=framer&logoColor=white" />
<img alt="Vercel" src="https://img.shields.io/badge/Vercel-Deploy-111111?style=for-the-badge&logo=vercel&logoColor=white" />
<img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge" />
<br/>
<img alt="Version" src="https://img.shields.io/badge/Version-1.0.0-FF006E?style=for-the-badge" />
<img alt="Build" src="https://img.shields.io/badge/Build-tsc_+_vite-00D9FF?style=for-the-badge" />
<img alt="ESLint" src="https://img.shields.io/badge/ESLint-Quality-8B5CF6?style=for-the-badge&logo=eslint&logoColor=white" />
<img alt="Prettier" src="https://img.shields.io/badge/Prettier-Format-00D9FF?style=for-the-badge&logo=prettier&logoColor=0B0B0B" />
<img alt="R3F" src="https://img.shields.io/badge/R3F-@react--three/fiber-111111?style=for-the-badge" />

<br/>

<table style="border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
  <tr>
    <td align="left">
      <strong>Runtime</strong><br/>
      <sub>React + R3F + Three.js (WebGL)</sub>
    </td>
    <td align="left">
      <strong>Artifact</strong><br/>
      <sub>Deterministic MLP weights → graph model</sub>
    </td>
    <td align="left">
      <strong>Delivery</strong><br/>
      <sub>Vercel CDN + immutable caching</sub>
    </td>
  </tr>
</table>

<br/>

</div>

---

## About

This repository is a modern, production-ready **frontend** built for **high-end interaction** and **visual storytelling**.

- **What it does**: Ships a fast portfolio SPA with an interactive 3D exhibit (**EXHIBIT 001 — Neural Lattice**) that visualizes a small feed-forward MLP as an animated graph.
- **Problem it solves**: Demonstrates real engineering execution (render loop, deterministic assets, performance gating, accessibility fallbacks) while delivering a premium UX.
- **Built for**: Engineering teams, recruiters, and product-minded collaborators evaluating **frontend architecture**, **rendering performance**, and **interaction design**.
- **Why it matters**: This isn’t a “static site with animations” — the exhibit is a miniature real-time system with **typed-array data structures**, **GPU shader materials**, and **runtime quality controls**.

---

## Key Features

- **GPU-accelerated neural lattice renderer** — Three.js scene driven by a real simulation loop (nodes, edges, packets, and 3D HUD).
- **Deterministic data artifact pipeline** — a Node script generates reproducible MLP weight files used by the runtime visualization.
- **Adaptive quality scaling** — dynamically selects render quality based on device DPR and CPU cores; controls DPR, fog, antialiasing, and particle budgets.
- **Accessibility-first motion model** — honors `prefers-reduced-motion` by switching the canvas to demand-driven rendering and disabling heavy simulation.
- **Interactive input-plane raycasting** — pointer intersection is computed against an input plane and translated into activation “brush strokes”.
- **Shader-based node material** — custom point shader controls intensity, halos, and ignition sequencing without per-frame React churn.
- **Performance-oriented build output** — manual vendor chunking, Terser console stripping, and immutable asset caching headers for CDN delivery.
- **Operationally clean deployment** — Vercel SPA rewrites + long-lived caching for static assets.

---

## Tech Stack

### Languages

<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-111111?style=for-the-badge&logo=javascript&logoColor=F7DF1E" />
<img alt="CSS" src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white" />

### Frontend

<img alt="React" src="https://img.shields.io/badge/React-00D9FF?style=for-the-badge&logo=react&logoColor=0B0B0B" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-8B5CF6?style=for-the-badge&logo=vite&logoColor=white" />
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-00D9FF?style=for-the-badge&logo=tailwindcss&logoColor=0B0B0B" />
<img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-FF006E?style=for-the-badge&logo=framer&logoColor=white" />

### 3D / Rendering

<img alt="Three.js" src="https://img.shields.io/badge/Three.js-111111?style=for-the-badge&logo=three.js&logoColor=white" />
<img alt="React Three Fiber" src="https://img.shields.io/badge/React_Three_Fiber-111111?style=for-the-badge" />
<img alt="@react-three/drei" src="https://img.shields.io/badge/drei-111111?style=for-the-badge" />
<img alt="WebGL" src="https://img.shields.io/badge/WebGL-8B5CF6?style=for-the-badge" />

### Tooling

<img alt="ESLint" src="https://img.shields.io/badge/ESLint-8B5CF6?style=for-the-badge&logo=eslint&logoColor=white" />
<img alt="Prettier" src="https://img.shields.io/badge/Prettier-00D9FF?style=for-the-badge&logo=prettier&logoColor=0B0B0B" />
<img alt="PostCSS" src="https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white" />
<img alt="Terser" src="https://img.shields.io/badge/Terser-111111?style=for-the-badge" />

### Deployment / Infrastructure

<img alt="Vercel" src="https://img.shields.io/badge/Vercel-111111?style=for-the-badge&logo=vercel&logoColor=white" />
<img alt="CDN Cache" src="https://img.shields.io/badge/CDN_Immutable_Cache-00D9FF?style=for-the-badge" />
<img alt="SPA Rewrites" src="https://img.shields.io/badge/SPA_Rewrites-8B5CF6?style=for-the-badge" />
<img alt="Custom Domain" src="https://img.shields.io/badge/CNAME-FF006E?style=for-the-badge" />

---

## Architecture

At runtime this is a **static SPA** plus an internal “mini-engine” that:

- loads a deterministic weights artifact (`/public/exhibits/exhibit001/mlp_weights.json`)
- converts weights → graph topology (**top‑K incoming edges per neuron**)
- runs a throttled forward pass (~30Hz) and writes results into GPU-friendly buffers
- renders nodes/edges/packets/HUD with additive blending and a custom shader material

### System architecture

```mermaid
flowchart LR
  U[User Browser] -->|HTTPS| V[Vercel Edge / CDN]
  V -->|SPA rewrite| I[index.html]
  V -->|immutable cache| A[JS/CSS Assets]
  V -->|force-cache| W[mlp_weights.json]

  subgraph Client Runtime
    R[React] --> C["@react-three/fiber Canvas"]
    C --> T[Three.js Renderer]
    T --> G["GPU: Points/Lines/Shader"]
    R --> F["Weights fetch + model build"]
    F --> S["Simulation loop + buffer updates"]
    S --> G
  end
```

### Component layout (runtime)

```mermaid
flowchart TD
  App[App.tsx]
  App --> Cursor[CustomCursor]
  App --> Hero[Hero]
  App --> Exhibit[NeuralLatticeSection]

  Exhibit --> Canvas[NeuralLatticeCanvas]
  Canvas --> Rig[LatticeRig]
  Rig --> Field[LatticeField]

  Field --> Mat["LatticePointsMaterial (shader)"]
  Field --> HUD[ProbabilityHUD3D]
  Field --> Weights[loadExhibit001Weights]
  Weights --> Model["buildNetworkModel(topK)"]
```

### Weights → model → render lifecycle

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Developer
  participant Gen as scripts/generate-exhibit001-weights.mjs
  participant Pub as public/exhibits/exhibit001/mlp_weights.json
  participant UI as LatticeField
  participant GPU as WebGL

  Dev->>Gen: npm run gen:exhibit001-weights
  Gen->>Pub: write deterministic JSON weights
  UI->>Pub: fetch("/exhibits/exhibit001/mlp_weights.json", { cache: "force-cache" })
  UI->>UI: buildNetworkModel(weights, topKIncoming)
  loop every frame
    UI->>UI: forward pass (~30Hz) + activities
    UI->>GPU: update BufferAttributes + shader uniforms
    GPU-->>UI: draw points/lines/packets + HUD
  end
```

### Performance & reliability notes

- **Throttled compute**: the forward pass is rate-limited to ~30Hz while rendering can stay smooth.
- **Typed arrays everywhere**: node positions, edges, colors, activities, packet state are stored in `Float32Array`/`Uint32Array` to reduce allocations and improve locality.
- **Top‑K edges**: the graph stays legible and bounded (reduces draw + update cost).
- **Reduced motion mode**: switches to `frameloop="demand"` and gates heavy simulation.
- **CDN caching**: `vercel.json` sets immutable caching for build assets.

---

## Documentation & Deep Examples

### 1) Generate deterministic weights (artifact pipeline)

```bash
npm run gen:exhibit001-weights
```

Output file:

- `public/exhibits/exhibit001/mlp_weights.json`

The generator uses a deterministic PRNG (`mulberry32(1337)`) so the artifact is reproducible across machines.

### 2) Load weights (runtime)

```ts
// src/components/exhibits/neural-lattice/neuralLattice.ts
export async function loadExhibit001Weights() {
  const res = await fetch("/exhibits/exhibit001/mlp_weights.json", { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load weights: ${res.status}`);
  // ...convert JSON arrays -> Float32Array
}
```

### 3) Build a graph model from weights (top‑K compression)

The runtime converts dense weight matrices into a sparse, visual-friendly graph.

```ts
// src/components/exhibits/neural-lattice/LatticeField.tsx
const topK = quality === "high" ? 6 : quality === "medium" ? 5 : 4;
setModel(buildNetworkModel(weights, topK));
```

### 4) Input interaction model (pointer → input plane → activations)

- Pointer is raycasted against an **input plane** at `x = -3.2`.
- The local pointer coordinates are used as an activation “brush” across the 8×8 input grid.

```ts
// inside LatticeField frame loop
const p = pointerOnInputPlaneRef.current;
for (let i = 0; i < inputCount; i++) {
  const idx = inputStart + i;
  const dy = positions[idx * 3 + 1] - p.y;
  const dz = positions[idx * 3 + 2] - p.z;
  const target = Math.exp(-(dy * dy + dz * dz) / 0.06);
  a0.current[i] = THREE.MathUtils.damp(a0.current[i], target, 10.0, delta);
}
```

### 5) Runtime “API”: static asset endpoints

Even though this is a frontend-only app, there is a real interface surface: the app fetches versioned assets from the CDN (documented below under **API Documentation**).

### 6) Keyboard shortcuts

| Key | Action |
|---:|---|
| `h` | Scroll to hero section |
| `l` | Scroll to Neural Lattice section |
| `?` | Show shortcut dialog |

### 7) Configuration / environment

No runtime environment variables are required for local dev or deployment.

| Variable | Required | Default | Description |
|---|---:|---|---|
| _(none)_ | No | — | Static SPA + assets |

---

## Getting Started

### Prerequisites

- **Node.js**: 18+ (recommended)
- **npm**: 9+
- **OS**: Windows/macOS/Linux

### Installation

```bash
npm install
```

### Local development

```bash
npm run dev
```

- Vite dev server: `http://localhost:5173`

### Type-checking & linting

```bash
npm run type-check
npm run lint
```

### Production build

```bash
npm run build
npm run preview
```

---

## API Documentation

This project does **not** expose a backend API. The “API surface” is a **static asset contract** consumed by the exhibit runtime.

### Endpoint summary

| Endpoint | Method | Purpose | Cache model |
|---|---:|---|---|
| `/exhibits/exhibit001/mlp_weights.json` | GET | MLP weights artifact for Exhibit 001 | Requested with `cache: force-cache`; served via CDN |

### Request / response example

```bash
curl -sS "http://localhost:5173/exhibits/exhibit001/mlp_weights.json" | head
```

Response shape (high level):

```json
{
  "name": "exhibit001_mlp_demo_v1",
  "createdAt": "2025-…",
  "note": "Deterministic demo weights for Exhibit 001 visualization.",
  "layers": [
    { "in": 64, "out": 48, "w": [/* ... */], "b": [/* ... */] },
    { "in": 48, "out": 24, "w": [/* ... */], "b": [/* ... */] },
    { "in": 24, "out": 10, "w": [/* ... */], "b": [/* ... */] }
  ]
}
```

### Error handling

- **Non-2xx responses**: the runtime throws `Failed to load weights: <status>` and logs the error in the console.
- **Common causes**: missing artifact (weights not generated/committed), misconfigured static hosting, or a broken rewrite rule.

### Auth & rate limits

- **Auth**: none (public static asset).
- **Rate limits**: none implemented at the app level (CDN/host policies apply).

### API lifecycle (runtime sequence)

```mermaid
sequenceDiagram
  autonumber
  participant UI as LatticeField
  participant CDN as CDN / Static Host

  UI->>CDN: GET /exhibits/exhibit001/mlp_weights.json\n(cache: force-cache)
  alt 200 OK
    CDN-->>UI: JSON weights\n(layers: w,b)
    UI->>UI: JSON -> Float32Array\nbuildNetworkModel(topK)
  else non-2xx
    CDN-->>UI: error status
    UI->>UI: throw + console.error
  end
```

---

## Production Deployment

This repo is configured for **Vercel**.

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **SPA routing**: `vercel.json` rewrites all routes to `index.html`
- **Cache headers**: immutable caching for `/assets/*` and `*.js`

If you use a custom domain, `CNAME` is present for DNS configuration.

```mermaid
flowchart LR
  Dev[Git push] --> V[Vercel Build]
  V -->|npm run build| D[dist/]
  D --> CDN[Vercel Edge/CDN]
  CDN --> Users[Browsers]
```

---

## Project Structure

```text
.
├── index.html
├── package.json
├── vite.config.ts              # Vite config (alias @ -> src, manualChunks)
├── vercel.json                 # SPA rewrites + immutable cache headers
├── scripts/
│   └── generate-exhibit001-weights.mjs   # Deterministic MLP weight generator
├── public/
│   └── exhibits/
│       └── exhibit001/
│           └── mlp_weights.json         # Generated weights artifact (runtime fetch)
└── src/
    ├── main.tsx                # React entry
    ├── App.tsx                 # App composition
    ├── components/
    │   ├── hero/                # Boot sequence + hero UI
    │   ├── ui/                  # Cursor + UI primitives
    │   └── exhibits/
    │       └── neural-lattice/  # Exhibit 001 runtime (3D + sim)
    ├── hooks/                   # Visual quality + reduced motion + shortcuts
    └── styles/
        └── globals.css          # Global styling + Exhibit 001 visuals
```

---

## License

MIT — see `LICENSE`.
