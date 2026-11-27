import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { getStickmanPose, StickmanAction } from "../animations/poses";

interface StickmanProps {
  action: StickmanAction;
  speed?: number;
  scale?: number;
  strokeColor?: string;
  strokeWidth?: number;
  x?: number;
  y?: number;
}

export const Stickman: React.FC<StickmanProps> = ({
  action,
  speed = 1,
  scale = 1.4,
  strokeColor = "#FFFFFF",
  strokeWidth = 10,
  x = 540,
  y = 1120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pose = getStickmanPose(action, frame / fps, speed);

  const torsoLen = 95;
  const headRadius = 30;
  const upperArmLen = 55;
  const forearmLen = 52;
  const thighLen = 62;
  const calfLen = 62;

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
        zIndex: 6,
      }}
    >
      <g
        transform={`translate(${x + pose.pelvisX}, ${y + pose.pelvisY}) scale(${scale})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <g transform={`rotate(${pose.leftHip})`}>
          <line x1={0} y1={0} x2={0} y2={thighLen} opacity={0.75} />
          <g transform={`translate(0, ${thighLen}) rotate(${pose.leftKnee})`}>
            <line x1={0} y1={0} x2={0} y2={calfLen} opacity={0.75} />
          </g>
        </g>

        <g transform={`translate(0, ${-torsoLen + 10}) rotate(${pose.leftShoulder})`}>
          <line x1={0} y1={0} x2={0} y2={upperArmLen} opacity={0.75} />
          <g transform={`translate(0, ${upperArmLen}) rotate(${pose.leftElbow})`}>
            <line x1={0} y1={0} x2={0} y2={forearmLen} opacity={0.75} />
          </g>
        </g>

        <g transform={`rotate(${pose.torsoAngle})`}>
          <line x1={0} y1={0} x2={0} y2={-torsoLen} />
          <g transform={`translate(0, ${-torsoLen - headRadius - 4}) rotate(${pose.headAngle})`}>
            <circle cx={0} cy={0} r={headRadius} fill={strokeColor === "#FFFFFF" ? "#0B0B0C" : "#FFFFFF"} />
          </g>

          <g transform={`translate(0, ${-torsoLen + 10}) rotate(${pose.rightShoulder})`}>
            <line x1={0} y1={0} x2={0} y2={upperArmLen} />
            <g transform={`translate(0, ${upperArmLen}) rotate(${pose.rightElbow})`}>
              <line x1={0} y1={0} x2={0} y2={forearmLen} />
            </g>
          </g>
        </g>

        <g transform={`rotate(${pose.rightHip})`}>
          <line x1={0} y1={0} x2={0} y2={thighLen} />
          <g transform={`translate(0, ${thighLen}) rotate(${pose.rightKnee})`}>
            <line x1={0} y1={0} x2={0} y2={calfLen} />
          </g>
        </g>
      </g>
    </svg>
  );
};
