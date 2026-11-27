import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { StickmanAction } from "../animations/poses";

interface PropsLayerProps {
  props?: string[];
  action: StickmanAction;
  speed?: number;
  isDark?: boolean;
}

export const PropsLayer: React.FC<PropsLayerProps> = ({
  props = [],
  action,
  speed = 1,
  isDark = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;

  const stroke = isDark ? "#E5E7EB" : "#111827";
  const subtleStroke = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.25)";
  const fillDark = isDark ? "#18181B" : "#E5E7EB";

  const hasRock = props.includes("heavy_rock");
  const hasInclinedFloor = props.includes("inclined_floor");
  const hasStairs = props.includes("stairs");
  const hasSummit = props.includes("summit_peak");
  const hasLightRays = props.includes("light_rays");

  const rockRoll = action === "push_boulder_uphill" ? Math.sin(t * 6.5) * 14 : 0;
  const rayPulse = interpolate(Math.sin(t * 2.5), [-1, 1], [0.14, 0.32]);

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {hasLightRays && (
        <g opacity={rayPulse}>
          <polygon points="540,180 220,1250 380,1250" fill={stroke} />
          <polygon points="540,180 470,1250 610,1250" fill={stroke} />
          <polygon points="540,180 700,1250 860,1250" fill={stroke} />
        </g>
      )}

      {hasSummit && (
        <polygon
          points="120,1520 540,1180 960,1520 960,1920 120,1920"
          fill={fillDark}
          stroke={stroke}
          strokeWidth={6}
        />
      )}

      {hasInclinedFloor && (
        <line
          x1={140}
          y1={1380}
          x2={940}
          y2={1060}
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
        />
      )}

      {!hasInclinedFloor && !hasSummit && (
        <line
          x1={160}
          y1={1245}
          x2={920}
          y2={1245}
          stroke={subtleStroke}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}

      {hasStairs && (
        <g stroke={stroke} strokeWidth={7} fill={fillDark}>
          {[0, 1, 2, 3, 4].map((step) => {
            const sx = 240 + step * 115;
            const sy = 1320 - step * 62;
            return <rect key={step} x={sx} y={sy} width={125} height={62} />;
          })}
        </g>
      )}

      {hasRock && (
        <g transform={`translate(715, 1075) rotate(${rockRoll})`}>
          <polygon
            points="-78,-22 -42,-82 36,-88 84,-34 72,38 10,66 -66,44"
            fill={fillDark}
            stroke={stroke}
            strokeWidth={8}
            strokeLinejoin="round"
          />
          <line
            x1={-32}
            y1={-40}
            x2={24}
            y2={18}
            stroke={subtleStroke}
            strokeWidth={4}
          />
        </g>
      )}
    </svg>
  );
};
