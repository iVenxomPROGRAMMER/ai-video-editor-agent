import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StickmanAction } from "./animations/poses";
import { KineticText, VisualTextConfig } from "./components/KineticText";
import { PropsLayer } from "./components/PropsLayer";
import { Stickman } from "./components/Stickman";

export interface SceneData {
  scene_id: number;
  duration_sec?: number;
  narration_text: string;
  visual_text?: VisualTextConfig;
  stickman: {
    action: StickmanAction;
    speed?: number;
    props?: string[];
  };
  camera?: {
    effect?: "slow_zoom_in" | "zoom_out_reveal" | "static";
    shake_intensity?: number;
  };
}

export interface ProjectData {
  project_meta: {
    title: string;
    resolution: { width: number; height: number };
    fps: number;
    theme: "dark_minimal" | "light_minimal";
  };
  scenes: SceneData[];
}

const SceneView: React.FC<{ scene: SceneData; isDark: boolean }> = ({ scene, isDark }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const effect = scene.camera?.effect ?? "slow_zoom_in";
  const shake = scene.camera?.shake_intensity ?? 0;
  const progress = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;

  let camScale = 1;
  if (effect === "slow_zoom_in") {
    camScale = interpolate(progress, [0, 1], [1.0, 1.09]);
  } else if (effect === "zoom_out_reveal") {
    camScale = interpolate(progress, [0, 1], [1.14, 1.0]);
  }

  const shakePx = shake * 12;
  const jitterX = shake > 0 ? Math.sin(frame * 1.7) * shakePx : 0;
  const jitterY = shake > 0 ? Math.cos(frame * 2.3) * shakePx : 0;

  const bgColor = isDark ? "#0B0B0C" : "#F8FAFC";
  const fgColor = isDark ? "#FFFFFF" : "#0B0B0C";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        overflow: "hidden",
        transform: `translate(${jitterX}px, ${jitterY}px) scale(${camScale})`,
        transformOrigin: "540px 1080px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "radial-gradient(circle at 50% 58%, rgba(255,255,255,0.06), transparent 65%)"
            : "radial-gradient(circle at 50% 58%, rgba(0,0,0,0.05), transparent 65%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <PropsLayer
        props={scene.stickman.props}
        action={scene.stickman.action}
        speed={scene.stickman.speed ?? 1}
        isDark={isDark}
      />

      <Stickman
        action={scene.stickman.action}
        speed={scene.stickman.speed ?? 1}
        strokeColor={fgColor}
        x={scene.stickman.props?.includes("heavy_rock") ? 465 : 540}
        y={scene.stickman.props?.includes("stairs") ? 1160 : 1120}
      />

      <KineticText
        text={scene.narration_text}
        config={scene.visual_text}
        isDark={isDark}
      />

      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 22,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: 0.35 + (frame / Math.max(1, fps)) * 0.02,
          color: fgColor,
          zIndex: 8,
        }}
      >
        CENA {scene.scene_id}
      </div>
    </AbsoluteFill>
  );
};

export const MainComposition: React.FC<{ project: ProjectData }> = ({ project }) => {
  const { fps } = useVideoConfig();
  const isDark = project.project_meta.theme !== "light_minimal";

  let cursorFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: isDark ? "#0B0B0C" : "#F8FAFC" }}>
      {project.scenes.map((scene) => {
        const durationInFrames = Math.max(1, Math.round((scene.duration_sec ?? 3.0) * fps));
        const from = cursorFrame;
        cursorFrame += durationInFrames;

        return (
          <Sequence key={scene.scene_id} from={from} durationInFrames={durationInFrames}>
            <SceneView scene={scene} isDark={isDark} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
