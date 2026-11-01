import React, { useEffect, useRef } from "react";

const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

const lerpColor = (c1, c2, t) => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t)),
];

const rgbStr = (rgb, alpha = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

// Multi-stop scroll palette matched 1:1 with index.css dashboard themes:
// - Dark Mode (:root): #0A0B0E (10,11,14), #101218 (16,18,24), #151821 (21,24,33),
//   accents: --aura-gold #D4A373 (212,163,115), --aura-violet #A594F9 (165,148,249), --aura-sage #7E9F8E (126,159,142), --aura-sky #6BA3BE (107,163,190)
// - Daylight Mode (html.light): #F5F2EB (245,242,235), #FAF8F3 (250,248,243),
//   accents: #D4A373 (212,163,115), #6BA3BE (107,163,190), #7E9F8E (126,159,142), #A594F9 (165,148,249)
// - Romantic Mode (html.romantic): #FDF5F7 (253,245,247), #FCECEF (252,236,239),
//   accents: #D87A90 (216,122,144), #E86F88 (232,111,136), #D4A373 (212,163,115), #A594F9 (165,148,249)
const PALETTE_STOPS = [
  {
    at: 0.0,
    bgTop: [10, 11, 14], // #0A0B0E (--bg-base)
    bgMid: [16, 18, 24], // #101218 (--bg-secondary)
    bgBot: [21, 24, 33], // #151821 (--bg-surface)
    glowA: [212, 163, 115], // #D4A373 (--aura-gold)
    glowB: [165, 148, 249], // #A594F9 (--aura-violet)
    glowC: [126, 159, 142], // #7E9F8E (--aura-sage)
    particleA: [212, 163, 115],
    particleB: [165, 148, 249],
    ringColor: [212, 163, 115],
    isLight: 0,
  },
  {
    at: 0.22,
    bgTop: [12, 14, 19],
    bgMid: [19, 22, 30],
    bgBot: [26, 29, 40],
    glowA: [212, 163, 115],
    glowB: [165, 148, 249],
    glowC: [107, 163, 190],
    particleA: [212, 163, 115],
    particleB: [165, 148, 249],
    ringColor: [212, 163, 115],
    isLight: 0.08,
  },
  {
    at: 0.35,
    bgTop: [245, 242, 235], // #F5F2EB (html.light --bg-base)
    bgMid: [250, 248, 243], // #FAF8F3 (html.light --bg-secondary)
    bgBot: [242, 236, 224], // #F2ECE0
    glowA: [212, 163, 115], // Warm brass sunlight
    glowB: [107, 163, 190], // --aura-sky
    glowC: [126, 159, 142], // --aura-sage
    particleA: [154, 107, 62],
    particleB: [59, 122, 158],
    ringColor: [154, 107, 62],
    isLight: 1,
  },
  {
    at: 0.56,
    bgTop: [245, 242, 235],
    bgMid: [250, 248, 243],
    bgBot: [246, 238, 232],
    glowA: [212, 163, 115],
    glowB: [107, 163, 190],
    glowC: [165, 148, 249],
    particleA: [154, 107, 62],
    particleB: [109, 90, 207],
    ringColor: [198, 139, 105],
    isLight: 1,
  },
  {
    at: 0.69,
    bgTop: [253, 245, 247], // #FDF5F7 (html.romantic --bg-base)
    bgMid: [252, 236, 239], // #FCECEF (html.romantic --bg-secondary)
    bgBot: [253, 234, 240],
    glowA: [216, 122, 144], // --aura-rose
    glowB: [232, 111, 136], // --aura-peach
    glowC: [212, 163, 115], // Champagne gold
    particleA: [201, 59, 107],
    particleB: [201, 130, 59],
    ringColor: [201, 59, 107],
    isLight: 0.9,
  },
  {
    at: 0.85,
    bgTop: [253, 245, 247],
    bgMid: [252, 236, 239],
    bgBot: [248, 228, 236],
    glowA: [201, 59, 107],
    glowB: [212, 163, 115],
    glowC: [165, 148, 249],
    particleA: [201, 59, 107],
    particleB: [212, 163, 115],
    ringColor: [212, 163, 115],
    isLight: 0.88,
  },
  {
    at: 1.0,
    bgTop: [10, 11, 14], // Return to signature #0A0B0E dark sanctuary with tri-theme aura
    bgMid: [16, 18, 24],
    bgBot: [21, 24, 33],
    glowA: [212, 163, 115], // Dark / Daylight Warm Gold
    glowB: [165, 148, 249], // Iris Violet
    glowC: [216, 122, 144], // Romantic Rose
    particleA: [212, 163, 115],
    particleB: [165, 148, 249],
    ringColor: [212, 163, 115],
    isLight: 0.05,
  },
];

export function sampleScrollPalette(scrollProgress) {
  const p = Math.max(0, Math.min(1, scrollProgress));
  for (let i = 0; i < PALETTE_STOPS.length - 1; i += 1) {
    const curr = PALETTE_STOPS[i];
    const next = PALETTE_STOPS[i + 1];
    if (p >= curr.at && p <= next.at) {
      const localT = (p - curr.at) / Math.max(0.0001, next.at - curr.at);
      const smoothT = localT * localT * (3 - 2 * localT);
      return {
        bgTop: lerpColor(curr.bgTop, next.bgTop, smoothT),
        bgMid: lerpColor(curr.bgMid, next.bgMid, smoothT),
        bgBot: lerpColor(curr.bgBot, next.bgBot, smoothT),
        glowA: lerpColor(curr.glowA, next.glowA, smoothT),
        glowB: lerpColor(curr.glowB, next.glowB, smoothT),
        glowC: lerpColor(curr.glowC, next.glowC, smoothT),
        particleA: lerpColor(curr.particleA, next.particleA, smoothT),
        particleB: lerpColor(curr.particleB, next.particleB, smoothT),
        ringColor: lerpColor(curr.ringColor, next.ringColor, smoothT),
        isLight: lerp(curr.isLight, next.isLight, smoothT),
      };
    }
  }
  return PALETTE_STOPS[0];
}

export const Landing3DStage = ({ scrollProgress = 0, pointer = { x: 0, y: 0 } }) => {
  const canvasRef = useRef(null);
  const targetScrollRef = useRef(scrollProgress);
  const smoothScrollRef = useRef(scrollProgress);
  const pointerRef = useRef(pointer);

  useEffect(() => {
    targetScrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationFrameId = null;
    let width = window.innerWidth || 1280;
    let height = window.innerHeight || 800;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth || 1280;
      height = window.innerHeight || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      if (ctx.setTransform) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const TOTAL_DEPTH = 3600;
    const particles = Array.from({ length: 110 }, (_, i) => ({
      id: i,
      x: (Math.sin(i * 12.9898) * 0.5) * 1600,
      y: (Math.cos(i * 78.233) * 0.5) * 1000,
      z: (i / 110) * TOTAL_DEPTH,
      radius: 1.3 + (i % 4) * 0.85,
      phase: i * 0.7,
      speed: 0.32 + (i % 5) * 0.11,
      variant: i % 2,
    }));

    let time = 0;

    const project3D = (x, y, z, camX, camY, camZ, fov = 620) => {
      const relZ = z - camZ;
      if (relZ <= 15) return null;
      const scale = fov / relZ;
      return {
        sx: width * 0.5 + (x - camX) * scale,
        sy: height * 0.5 + (y - camY) * scale,
        scale,
        relZ,
      };
    };

    const drawArchPath = (cx, cy, archW, archH) => {
      const r = archW * 0.5;
      const straightH = Math.max(20, archH - r);
      ctx.beginPath();
      ctx.arc(cx, cy - straightH * 0.35, r, Math.PI, 0, false);
      ctx.lineTo(cx + r, cy + straightH * 0.65);
      ctx.lineTo(cx - r, cy + straightH * 0.65);
      ctx.closePath();
    };

    const render = () => {
      time += 0.014;
      smoothScrollRef.current += (targetScrollRef.current - smoothScrollRef.current) * 0.085;
      const s = Math.max(0, Math.min(1, smoothScrollRef.current));
      const pal = sampleScrollPalette(s);

      const camZ = s * 3200;
      const camX = (pointerRef.current?.x || 0) * 52;
      const camY = (pointerRef.current?.y || 0) * 32;

      // 1. Continuous Atmospheric Background Matched to Dashboard Theme
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, rgbStr(pal.bgTop, 1));
      skyGrad.addColorStop(0.55, rgbStr(pal.bgMid, 1));
      skyGrad.addColorStop(1, rgbStr(pal.bgBot, 1));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Ambient Mineral & Botanical Aura Spheres (matching --page-gradient in index.css)
      if (ctx.createRadialGradient) {
        const orbs = [
          {
            x: width * (0.5 + Math.sin(time * 0.35) * 0.04) - camX * 0.25,
            y: height * 0.08 - camY * 0.25,
            r: Math.max(width, height) * 0.52,
            color: pal.glowA,
            alpha: pal.isLight > 0.5 ? 0.16 : 0.12,
          },
          {
            x: width * (0.82 + Math.cos(time * 0.3) * 0.04) - camX * 0.2,
            y: height * (0.3 + Math.sin(time * 0.4) * 0.04) - camY * 0.2,
            r: Math.max(width, height) * 0.42,
            color: pal.glowB,
            alpha: pal.isLight > 0.5 ? 0.13 : 0.1,
          },
          {
            x: width * 0.18 - camX * 0.15,
            y: height * 0.78 - camY * 0.15,
            r: Math.max(width, height) * 0.46,
            color: pal.glowC,
            alpha: pal.isLight > 0.5 ? 0.14 : 0.1,
          },
        ];

        orbs.forEach((orb) => {
          const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
          g.addColorStop(0, rgbStr(orb.color, orb.alpha));
          g.addColorStop(0.55, rgbStr(orb.color, orb.alpha * 0.35));
          g.addColorStop(1, rgbStr(orb.color, 0));
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, width, height);
        });
      }

      // 3. Daylight Volumetric Sunlight Rays (s in 0.20..0.66)
      if (s > 0.2 && s < 0.66) {
        const sunVis =
          s < 0.34
            ? (s - 0.2) / 0.14
            : s > 0.54
            ? 1 - (s - 0.54) / 0.12
            : 1;
        const clampedSun = Math.max(0, Math.min(1, sunVis));
        ctx.save();
        for (let r = 0; r < 5; r += 1) {
          const angle = -0.32 + r * 0.13 + Math.sin(time * 0.28 + r) * 0.02;
          ctx.save();
          ctx.translate(width * 0.5 - camX * 0.2, -60);
          ctx.rotate(angle);
          const rayGrad = ctx.createLinearGradient(0, 0, 0, height * 1.3);
          rayGrad.addColorStop(0, `rgba(212, 163, 115, ${0.14 * clampedSun})`);
          rayGrad.addColorStop(0.6, `rgba(107, 163, 190, ${0.06 * clampedSun})`);
          rayGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = rayGrad;
          ctx.fillRect(-70 - r * 12, 0, 140 + r * 24, height * 1.3);
          ctx.restore();
        }
        ctx.restore();
      }

      // 4. Transition 1: 3D Circular Glass Portal Tunnel (z = 680..1120)
      for (let i = 0; i < 8; i += 1) {
        const ringZ = 680 + i * 62;
        const proj = project3D(0, 0, ringZ, camX * 0.65, camY * 0.65, camZ);
        if (proj && proj.relZ < 1500) {
          const radius = 290 * proj.scale;
          if (radius > 4 && radius < Math.max(width, height) * 1.6) {
            const distAlpha = Math.max(0, Math.min(1, (1 - proj.relZ / 1400) * (proj.relZ / 160)));
            ctx.save();
            ctx.beginPath();
            ctx.arc(proj.sx, proj.sy, radius, 0, Math.PI * 2);
            ctx.strokeStyle =
              i % 2 === 0
                ? rgbStr(pal.glowA, 0.36 * distAlpha)
                : rgbStr(pal.glowB, 0.3 * distAlpha);
            ctx.lineWidth = Math.max(1.1, 2.8 * proj.scale);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(proj.sx, proj.sy, radius * 0.94, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244, 239, 230, ${0.18 * distAlpha})`;
            ctx.lineWidth = Math.max(0.6, 1 * proj.scale);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 5. Transition 2: 3D Floating Translucent Glass Arches (z = 1860..2320)
      for (let i = 0; i < 7; i += 1) {
        const archZ = 1860 + i * 72;
        const proj = project3D(0, 15, archZ, camX * 0.65, camY * 0.65, camZ);
        if (proj && proj.relZ < 1550) {
          const archW = 480 * proj.scale;
          const archH = 620 * proj.scale;
          if (archW > 12 && archW < width * 2.2) {
            const distAlpha = Math.max(0, Math.min(1, (1 - proj.relZ / 1450) * (proj.relZ / 180)));
            ctx.save();
            drawArchPath(proj.sx, proj.sy, archW, archH);
            ctx.strokeStyle =
              i % 2 === 0
                ? `rgba(212, 163, 115, ${0.38 * distAlpha})`
                : `rgba(201, 59, 107, ${0.32 * distAlpha})`;
            ctx.lineWidth = Math.max(1.2, 3 * proj.scale);
            ctx.stroke();

            ctx.fillStyle = `rgba(253, 245, 247, ${0.03 * distAlpha})`;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // 6. Romantic Mode & Brand Reveal: Delicate Flowing Light Ribbons
      if (s > 0.54) {
        const ribbonVis = Math.min(1, (s - 0.54) / 0.16);
        for (let r = 0; r < 3; r += 1) {
          ctx.save();
          ctx.beginPath();
          const baseY = height * (0.34 + r * 0.16) - camY * (0.2 + r * 0.08);
          for (let x = 0; x <= width; x += 28) {
            const wave =
              Math.sin(x * 0.0045 + time * (0.9 + r * 0.2) + r * 1.7) * (34 + r * 12) +
              Math.cos(x * 0.002 - time * 0.6) * 16;
            const py = baseY + wave;
            if (x === 0) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          const ribbonColors = [
            `rgba(216, 122, 144, ${0.24 * ribbonVis})`,
            `rgba(212, 163, 115, ${0.26 * ribbonVis})`,
            `rgba(165, 148, 249, ${0.22 * ribbonVis})`,
          ];
          ctx.strokeStyle = ribbonColors[r % ribbonColors.length];
          ctx.lineWidth = 2 - r * 0.35;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 7. 3D Particles & Starfield in Perspective Space
      particles.forEach((pt) => {
        let relZ = ((pt.z - camZ * 0.85) % TOTAL_DEPTH + TOTAL_DEPTH) % TOTAL_DEPTH;
        if (relZ < 25) relZ += TOTAL_DEPTH;
        const worldZ = camZ + relZ;
        const floatX = pt.x + Math.sin(time * pt.speed + pt.phase) * 26;
        const floatY = pt.y + Math.cos(time * pt.speed * 0.9 + pt.phase) * 22;

        const proj = project3D(floatX, floatY, worldZ, camX, camY, camZ);
        if (!proj || proj.relZ > 1800) return;
        if (proj.sx < -40 || proj.sx > width + 40 || proj.sy < -40 || proj.sy > height + 40) return;

        const depthFade = Math.max(0, Math.min(1, 1 - proj.relZ / 1700));
        const r = Math.max(0.8, pt.radius * proj.scale * 2.1);
        const col = pt.variant === 0 ? pal.particleA : pal.particleB;

        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = rgbStr(col, (pal.isLight > 0.5 ? 0.5 : 0.65) * depthFade);
        ctx.fill();
      });

      // 8. Final Section (s > 0.82): Tri-Theme Harmonious 3D Emblem Rings
      if (s > 0.8) {
        const finaleVis = Math.min(1, (s - 0.8) / 0.14);
        const cx = width * 0.5 - camX * 0.25;
        const cy = height * 0.46 - camY * 0.25;
        const baseR = Math.min(width, height) * 0.28;
        const triColors = [
          [212, 163, 115], // --aura-gold (#D4A373)
          [165, 148, 249], // --aura-violet (#A594F9)
          [216, 122, 144], // --aura-rose (#D87A90)
        ];
        triColors.forEach((col, idx) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * (0.2 + idx * 0.07) * (idx % 2 === 0 ? 1 : -1));
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, baseR * (0.85 + idx * 0.16), baseR * (0.52 + idx * 0.12), idx * 0.9, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, baseR * (0.82 + idx * 0.14), 0, Math.PI * 2);
          }
          ctx.strokeStyle = rgbStr(col, 0.34 * finaleVis);
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
        });
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="landing-3d-stage"
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default Landing3DStage;
