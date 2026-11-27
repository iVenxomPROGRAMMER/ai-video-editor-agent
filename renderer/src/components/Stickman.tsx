import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { StickmanAction } from "../animations/poses";

interface StickmanProps {
  action: StickmanAction;
  speed?: number;
  strokeColor?: string;
  x?: number;
  y?: number;
  props?: string[];
}

interface Point {
  x: number;
  y: number;
}

export const Stickman: React.FC<StickmanProps> = ({
  action,
  speed = 1,
  strokeColor = "#F8FAFC",
  x = 540,
  y = 1120,
  props = [],
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress =
    durationInFrames > 1 ? Math.min(1, frame / (durationInFrames - 1)) : 0;

  const hasInclined = props.includes("inclined_floor");
  const hasRock = props.includes("heavy_rock");
  const hasStairs = props.includes("stairs");
  const hasSummit = props.includes("summit_peak");

  const t = frame * 0.14 * speed;
  const sinT = Math.sin(t);
  const cosT = Math.cos(t);

  // Coordenadas base em espaço local do SVG (1080x1920)
  let hip: Point = { x, y: y + 155 };
  let shoulder: Point = { x, y: y + 35 };
  let head: Point = { x, y: y - 22 };
  let leftFoot: Point = { x: x - 34, y: y + 265 };
  let rightFoot: Point = { x: x + 34, y: y + 265 };
  let leftKnee: Point = { x: x - 38, y: y + 210 };
  let rightKnee: Point = { x: x + 38, y: y + 210 };
  let leftHand: Point = { x: x - 48, y: y + 115 };
  let rightHand: Point = { x: x + 48, y: y + 115 };

  if (action === "push_boulder_uphill" || hasRock) {
    const climbAdvance =
      action === "push_boulder_uphill"
        ? interpolate(progress, [0, 1], [-18, 26])
        : 0;
    const slopeRad = (-20 * Math.PI) / 180;
    const dx = climbAdvance * Math.cos(slopeRad);
    const dy = climbAdvance * Math.sin(slopeRad);

    const anchorX = 485 + dx;
    const anchorY = 1232 + dy;
    const pushPulse = Math.abs(sinT) * 10;

    hip = { x: anchorX - 18 - pushPulse * 0.4, y: anchorY - 96 + pushPulse * 0.35 };
    shoulder = { x: anchorX + 36 - pushPulse * 0.2, y: anchorY - 188 + pushPulse * 0.25 };
    head = { x: shoulder.x + 24, y: shoulder.y - 46 };

    const stride = sinT * 24;
    leftFoot = {
      x: anchorX - 36 + stride * 0.7,
      y: anchorY - stride * 0.25,
    };
    rightFoot = {
      x: anchorX + 22 - stride * 0.7,
      y: anchorY + 18 + stride * 0.25,
    };

    leftKnee = {
      x: (hip.x + leftFoot.x) * 0.5 + 16,
      y: (hip.y + leftFoot.y) * 0.5 - 8,
    };
    rightKnee = {
      x: (hip.x + rightFoot.x) * 0.5 + 18,
      y: (hip.y + rightFoot.y) * 0.5 - 6,
    };

    const rockX = 635 + dx;
    const rockY = 1098 + dy;
    leftHand = { x: rockX - 58, y: rockY - 6 };
    rightHand = { x: rockX - 50, y: rockY + 14 };
  } else if (action === "climb_stairs" || hasStairs) {
    const stepShift = interpolate(progress, [0, 1], [-55, 85]);
    const baseX = 440 + stepShift;
    const baseY = 1340 - stepShift * 0.62;
    const bob = Math.abs(sinT) * 14;

    hip = { x: baseX, y: baseY - 105 - bob };
    shoulder = { x: baseX + 18, y: baseY - 195 - bob };
    head = { x: shoulder.x + 12, y: shoulder.y - 48 };

    leftFoot = {
      x: baseX - 24 + sinT * 26,
      y: baseY - Math.max(0, cosT) * 26,
    };
    rightFoot = {
      x: baseX + 26 - sinT * 26,
      y: baseY - Math.max(0, -cosT) * 26,
    };

    leftKnee = {
      x: (hip.x + leftFoot.x) * 0.5 + 18,
      y: (hip.y + leftFoot.y) * 0.5 - 12,
    };
    rightKnee = {
      x: (hip.x + rightFoot.x) * 0.5 + 18,
      y: (hip.y + rightFoot.y) * 0.5 - 12,
    };

    leftHand = {
      x: shoulder.x - 24 + cosT * 24,
      y: shoulder.y + 68 - sinT * 18,
    };
    rightHand = {
      x: shoulder.x + 28 - cosT * 24,
      y: shoulder.y + 68 + sinT * 18,
    };
  } else if (action === "celebrate_arms_up" || hasSummit) {
    const bounce = Math.abs(sinT) * 16;
    const summitX = 540;
    const summitY = 1255;

    hip = { x: summitX, y: summitY - 105 - bounce };
    shoulder = { x: summitX, y: summitY - 198 - bounce };
    head = { x: summitX, y: shoulder.y - 50 };

    leftFoot = { x: summitX - 34, y: summitY - bounce * 0.4 };
    rightFoot = { x: summitX + 34, y: summitY - bounce * 0.4 };

    leftKnee = { x: summitX - 38, y: hip.y + 52 };
    rightKnee = { x: summitX + 38, y: hip.y + 52 };

    const wave = sinT * 14;
    leftHand = { x: summitX - 78, y: shoulder.y - 108 + wave };
    rightHand = { x: summitX + 78, y: shoulder.y - 108 - wave };
  } else {
    // idle / chão plano
    const breath = sinT * 6;
    const groundY = hasInclined ? 1228 : 1285;
    hip = { x: 540, y: groundY - 105 + breath * 0.5 };
    shoulder = { x: 540, y: groundY - 195 + breath };
    head = { x: 540, y: shoulder.y - 48 };

    leftFoot = { x: 506, y: groundY };
    rightFoot = { x: 574, y: groundY };

    leftKnee = { x: 510, y: (hip.y + leftFoot.y) * 0.5 };
    rightKnee = { x: 570, y: (hip.y + rightFoot.y) * 0.5 };

    leftHand = { x: 492, y: shoulder.y + 76 + breath };
    rightHand = { x: 588, y: shoulder.y + 76 - breath };
  }

  const leftElbow: Point = {
    x: (shoulder.x + leftHand.x) * 0.5 - 12,
    y: (shoulder.y + leftHand.y) * 0.5 + 14,
  };
  const rightElbow: Point = {
    x: (shoulder.x + rightHand.x) * 0.5 + 12,
    y: (shoulder.y + rightHand.y) * 0.5 + 14,
  };

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        filter: `drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))`,
      }}
    >
      <g
        stroke={strokeColor}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Perna esquerda */}
        <polyline
          points={`${hip.x},${hip.y} ${leftKnee.x},${leftKnee.y} ${leftFoot.x},${leftFoot.y}`}
        />
        {/* Perna direita */}
        <polyline
          points={`${hip.x},${hip.y} ${rightKnee.x},${rightKnee.y} ${rightFoot.x},${rightFoot.y}`}
        />

        {/* Tronco */}
        <line x1={hip.x} y1={hip.y} x2={shoulder.x} y2={shoulder.y} />

        {/* Braço esquerdo */}
        <polyline
          points={`${shoulder.x},${shoulder.y} ${leftElbow.x},${leftElbow.y} ${leftHand.x},${leftHand.y}`}
        />
        {/* Braço direito */}
        <polyline
          points={`${shoulder.x},${shoulder.y} ${rightElbow.x},${rightElbow.y} ${rightHand.x},${rightHand.y}`}
        />

        {/* Cabeça */}
        <circle
          cx={head.x}
          cy={head.y}
          r={34}
          fill={strokeColor === "#F8FAFC" ? "#0B0B0C" : "#F8FAFC"}
          stroke={strokeColor}
          strokeWidth={11}
        />
      </g>
    </svg>
  );
};
