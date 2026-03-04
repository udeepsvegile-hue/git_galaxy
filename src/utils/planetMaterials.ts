/**
 * GitVerse — Planet Materials
 * Generates procedural THREE.js materials for each planet texture type.
 * Uses canvas-based textures; no external image assets required.
 */

import * as THREE from "three";
import type { PlanetConfig, PlanetTextureType } from "@/types";

// Cache materials by planet id to avoid recreation
const materialCache = new Map<string, THREE.Material>();

export function buildPlanetMaterial(planet: PlanetConfig): THREE.Material {
  const cacheKey = `${planet.id}-${planet.textureType}-${planet.surfaceComplexity.toFixed(2)}`;
  if (materialCache.has(cacheKey)) return materialCache.get(cacheKey)!;

  const mat = createMaterial(planet.textureType, planet.planetColor, planet.surfaceComplexity, planet.glowIntensity);
  materialCache.set(cacheKey, mat);
  return mat;
}

// ─────────────────────────────────────────────────
//  Per-type material builders
// ─────────────────────────────────────────────────

function createMaterial(
  type: PlanetTextureType,
  baseColor: string,
  complexity: number,
  glow: number
): THREE.MeshStandardMaterial {
  const col = new THREE.Color(baseColor);
  const tex = generateSurfaceTexture(type, col, complexity);

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: getRoughness(type),
    metalness: getMetalness(type),
    emissiveMap: glow > 0.3 ? generateEmissiveTexture(type, col, glow) : undefined,
    emissive: glow > 0.3 ? col : new THREE.Color(0),
    emissiveIntensity: glow * 0.4,
  });

  return mat;
}

function getRoughness(type: PlanetTextureType): number {
  const map: Record<PlanetTextureType, number> = {
    rocky: 0.92, oceanic: 0.3, gaseous: 0.6, icy: 0.15,
    volcanic: 0.85, desert: 0.9, forest: 0.7, crystalline: 0.05,
  };
  return map[type];
}

function getMetalness(type: PlanetTextureType): number {
  const map: Record<PlanetTextureType, number> = {
    rocky: 0.05, oceanic: 0.1, gaseous: 0.0, icy: 0.2,
    volcanic: 0.1, desert: 0.02, forest: 0.0, crystalline: 0.8,
  };
  return map[type];
}

// ─────────────────────────────────────────────────
//  Procedural Surface Texture Generator
// ─────────────────────────────────────────────────

function generateSurfaceTexture(
  type: PlanetTextureType,
  baseColor: THREE.Color,
  complexity: number
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  switch (type) {
    case "oceanic":   drawOceanic(ctx, baseColor, complexity, size); break;
    case "gaseous":   drawGaseous(ctx, baseColor, complexity, size); break;
    case "icy":       drawIcy(ctx, baseColor, complexity, size);     break;
    case "volcanic":  drawVolcanic(ctx, baseColor, complexity, size);break;
    case "desert":    drawDesert(ctx, baseColor, complexity, size);  break;
    case "forest":    drawForest(ctx, baseColor, complexity, size);  break;
    case "crystalline": drawCrystalline(ctx, baseColor, complexity, size); break;
    default:          drawRocky(ctx, baseColor, complexity, size);   break;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function generateEmissiveTexture(
  type: PlanetTextureType,
  baseColor: THREE.Color,
  _glow: number
): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;

  // Simple emissive: bright spots scattered
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  const r = Math.round(baseColor.r * 255);
  const g = Math.round(baseColor.g * 255);
  const b = Math.round(baseColor.b * 255);

  const spots = type === "volcanic" ? 30 : type === "crystalline" ? 20 : 8;
  for (let i = 0; i < spots; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rad = 2 + Math.random() * 6;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.8)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return new THREE.CanvasTexture(c);
}

// ─────────────────────────────────────────────────
//  Surface painters
// ─────────────────────────────────────────────────

function lerpColor(a: THREE.Color, b: THREE.Color, t: number): string {
  const c = a.clone().lerp(b, t);
  return `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
}

function drawRocky(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.1, 0.1, 0.1), 0.4);
  ctx.fillRect(0, 0, size, size);
  const craters = Math.floor(complexity * 30) + 5;
  for (let i = 0; i < craters; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 2 + Math.random() * 12;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,0.6)");
    g.addColorStop(0.7, "rgba(100,100,100,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawOceanic(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  // Ocean base
  ctx.fillStyle = lerpColor(col, new THREE.Color(0, 0.3, 0.8), 0.5);
  ctx.fillRect(0, 0, size, size);
  // Land masses
  const lands = Math.floor(complexity * 6) + 2;
  for (let i = 0; i < lands; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 10 + Math.random() * 30;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const landCol = lerpColor(col, new THREE.Color(0.2, 0.5, 0.1), 0.5);
    g.addColorStop(0, landCol);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawGaseous(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  // Horizontal banded gas giant
  const bands = Math.floor(complexity * 8) + 4;
  for (let i = 0; i < bands; i++) {
    const y0 = (i / bands) * size;
    const h = size / bands;
    const t = (i % 2 === 0) ? 0.2 : 0.6;
    ctx.fillStyle = lerpColor(col, new THREE.Color(0.9, 0.7, 0.4), t);
    ctx.fillRect(0, y0, size, h);
    // Swirl
    for (let s = 0; s < 3; s++) {
      const sx = Math.random() * size;
      const sy = y0 + Math.random() * h;
      const sr = 5 + Math.random() * 20;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      g.addColorStop(0, `rgba(255,255,255,0.08)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawIcy(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.85, 0.95, 1), 0.6);
  ctx.fillRect(0, 0, size, size);
  // Cracks
  const cracks = Math.floor(complexity * 20) + 8;
  for (let i = 0; i < cracks; i++) {
    ctx.strokeStyle = lerpColor(col, new THREE.Color(0.5, 0.8, 1), 0.7);
    ctx.lineWidth = Math.random() * 1.5;
    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.lineTo(Math.random() * size, Math.random() * size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawVolcanic(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.1, 0.05, 0.02), 0.6);
  ctx.fillRect(0, 0, size, size);
  // Lava flows
  const flows = Math.floor(complexity * 15) + 5;
  for (let i = 0; i < flows; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 3 + Math.random() * 15;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255, 140, 0, 0.9)");
    g.addColorStop(0.5, "rgba(200, 50, 0, 0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawDesert(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.9, 0.7, 0.4), 0.5);
  ctx.fillRect(0, 0, size, size);
  // Dunes
  const duneStep = Math.max(4, Math.floor(12 - complexity * 6));
  for (let i = 0; i < size; i += duneStep) {
    const offset = Math.sin(i * 0.05) * 20;
    ctx.fillStyle = lerpColor(col, new THREE.Color(0.6, 0.4, 0.2), 0.4);
    ctx.globalAlpha = 0.15 + Math.random() * 0.15;
    ctx.fillRect(0, i + offset, size, 4 + Math.random() * 8);
  }
  ctx.globalAlpha = 1;
}

function drawForest(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.05, 0.3, 0.05), 0.5);
  ctx.fillRect(0, 0, size, size);
  // Canopy blobs
  const trees = Math.floor(complexity * 40) + 15;
  for (let i = 0; i < trees; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 4 + Math.random() * 10;
    const shade = Math.random();
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, shade > 0.5 ? "rgba(60,130,40,0.7)" : "rgba(20,80,20,0.8)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCrystalline(ctx: CanvasRenderingContext2D, col: THREE.Color, complexity: number, size: number) {
  ctx.fillStyle = lerpColor(col, new THREE.Color(0.05, 0.05, 0.15), 0.7);
  ctx.fillRect(0, 0, size, size);
  // Facets
  const facets = Math.floor(complexity * 25) + 10;
  for (let i = 0; i < facets; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const s = 8 + Math.random() * 25;
    const g = ctx.createLinearGradient(x - s, y - s, x + s, y + s);
    g.addColorStop(0, lerpColor(col, new THREE.Color(1, 1, 1), 0.7));
    g.addColorStop(0.5, lerpColor(col, new THREE.Color(0.5, 0.7, 1), 0.5));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.25 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.6, y + s * 0.4);
    ctx.lineTo(x - s * 0.6, y + s * 0.4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
