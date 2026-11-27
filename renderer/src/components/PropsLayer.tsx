import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { StickmanAction } from "../animations/poses";

interface PropsLayerProps {
  props?: string[];
  action: StickmanAction;
  speed: number;
  isDark: boolean;
}

export const PropsLayer: React.FC<PropsLayerProps> = ({
  props = [],
  action,
  speed,
  isDark,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress =
    durationInFrames > 1 ? Math.min(1, frame / (durationInFrames - 1)) : 0;

  const hasInclined = props.includes("inclined_floor");
  const hasRock = props.includes("heavy_rock");
  const hasStairs = props.includes("stairs");
  const hasSummit = props.includes("summit_peak");
  const hasRays = props.includes("light_rays");

  const strokePrimary = isDark ? "rgba(248, 250, 252, 0.9)" : "rgba(15, 23, 42, 0.9)";
  const fillGroundStart = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)";
  const fillGroundEnd = isDark ? "rgba(11, 11, 12, 0.98)" : "rgba(248, 250, 252, 0.98)";

  // Partículas atmosféricas sutis
  const particles = Array.from({ length: 14 }, (_, i) => {
    const baseX = ((i * 193) % 960) + 60;
    const baseY = ((i * 271) % 1100) + 420;
    const driftY = ((frame * (0.4 + (i % 4) * 0.18) * speed) % 160);
    const driftX = Math.sin(frame * 0.03 + i) * 14;
    const radius = 2 + (i % 3) * 1.4;
    const alpha = 0.12 + (i % 4) * 0.05;
    return { x: baseX + driftX, y: baseY - driftY, r: radius, alpha };
  });

  // Posição e rotação da pedra ao longo da rampa (-20 graus)
  const climbAdvance =
    action === "push_boulder_uphill"
      ? interpolate(progress, [0, 1], [-18, 26])
      : 0;
  const rockX = 635 + climbAdvance * Math.cos((-20 * Math.PI) / 180);
  const rockY = 1098 + climbAdvance * Math.sin((-20 * Math.PI) / 180);
  const rockRotation = frame * 1.4 * speed;

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillGroundStart} />
          <stop offset="100%" stopColor={fillGroundEnd} />
        </linearGradient>

        <radialGradient id="rockGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={isDark ? "#3F3F46" : "#CBD5E1"} />
          <stop offset="65%" stopColor={isDark ? "#18181B" : "#94A3B8"} />
          <stop offset="100%" stopColor={isDark ? "#09090B" : "#64748B"} />
        </radialGradient>

        <linearGradient id="rayGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop
            offset="0%"
            stopColor={isDark ? "rgba(250, 204, 21, 0.24)" : "rgba(37, 99, 235, 0.20)"}
          />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Partículas ambientais */}
      {particles.map((p, idx) => (
        <circle
          key={idx}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={isDark ? "#FACC15" : "#2563EB"}
          opacity={p.alpha}
        />
      ))}

      {/* Raios de luz no topo (cena de conquista) */}
      {hasRays && (
        <g opacity={0.75 + Math.sin(frame * 0.08) * 0.15}>
          <polygon points="540,420 260,1360 440,1360" fill="url(#rayGrad)" />
          <polygon points="540,420 490,1360 590,1360" fill="url(#rayGrad)" />
          <polygon points="540,420 640,1360 820,1360" fill="url(#rayGrad)" />
        </g>
      )}

      {/* Rampa inclinada sólida */}
      {hasInclined && (
        <g>
          <polygon
            points="120,1380 960,1074 960,1920 120,1920"
            fill="url(#groundGrad)"
          />
          <line
            x1={120}
            y1={1380}
            x2={960}
            y2={1074}
            stroke={strokePrimary}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Escada */}
      {hasStairs && (
        <g>
          <polygon
            points="220,1420 340,1420 340,1340 460,1340 460,1260 580,1260 580,1180 700,1180 700,1100 860,1100 860,1920 220,1920"
            fill="url(#groundGrad)"
          />
          <polyline
            points="220,1420 340,1420 340,1340 460,1340 460,1260 580,1260 580,1180 700,1180 700,1100 860,1100"
            fill="none"
            stroke={strokePrimary}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Pico / Montanha de conquista */}
      {hasSummit && (
        <g>
          <polygon
            points="180,1520 540,1255 900,1520 900,1920 180,1920"
            fill="url(#groundGrad)"
          />
          <polyline
            points="180,1520 540,1255 900,1520"
            fill="none"
            stroke={strokePrimary}
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Chão plano padrão quando não há rampa, escada ou cume */}
      {!hasInclined && !hasStairs && !hasSummit && (
        <g>
          <rect
            x={140}
            y={1285}
            width={800}
            height={635}
            fill="url(#groundGrad)"
          />
          <line
            x1={140}
            y1={1285}
            x2={940}
            y2={1285}
            stroke={strokePrimary}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Pedra pesada com volume e rotação */}
      {hasRock && (
        <g transform={`translate(${rockX}, ${rockY}) rotate(${rockRotation})`}>
          <polygon
            points="-68,-38 -25,-72 34,-68 72,-26 66,36 22,72 -42,64 -74,16"
            fill="url(#rockGrad)"
            stroke={strokePrimary}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <polyline
            points="-36,-24 -8,-42 26,-30"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.25)"}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <polyline
            points="-18,22 14,34 38,14"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.18)"}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};
