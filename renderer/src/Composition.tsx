import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticText, VisualTextConfig } from "./components/KineticText";
import { PropsLayer } from "./components/PropsLayer";
import { Stickman } from "./components/Stickman";
import { StickmanAction } from "./animations/poses";

export interface SceneItem {
  scene_id: number;
  duration_sec: number;
  narration_text: string;
  visual_text?: VisualTextConfig;
  stickman: {
    action: StickmanAction;
    speed?: number;
    expression?: string;
    props?: string[];
  };
  camera?: {
    effect?: "slow_zoom_in" | "zoom_out_reveal" | "static" | string;
    shake_intensity?: number;
  };
}

export interface ProjectData {
  project_meta: {
    title: string;
    resolution: { width: number; height: number };
    fps: number;
    theme: "dark_minimal" | "light_minimal" | string;
  };
  scenes: SceneItem[];
}

const SceneView: React.FC<{ scene: SceneItem; isDark: boolean }> = ({
  scene,
  isDark,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const effect = scene.camera?.effect ?? "slow_zoom_in";
  const shake = scene.camera?.shake_intensity ?? 0;

  let scale = 1;
  if (effect === "slow_zoom_in") {
    scale = interpolate(frame, [0, durationInFrames], [1.0, 1.07], {
      extrapolateRight: "clamp",
    });
  } else if (effect === "zoom_out_reveal") {
    scale = interpolate(frame, [0, durationInFrames], [1.08, 1.0], {
      extrapolateRight: "clamp",
    });
  }

  const shakeX = shake > 0 ? Math.sin(frame * 1.7) * shake * 14 : 0;
  const shakeY = shake > 0 ? Math.cos(frame * 2.1) * shake * 10 : 0;
  const strokeColor = isDark ? "#F8FAFC" : "#0F172A";

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <PropsLayer
        props={scene.stickman.props ?? []}
        action={scene.stickman.action}
        speed={scene.stickman.speed ?? 1}
        isDark={isDark}
      />

      <Stickman
        action={scene.stickman.action}
        speed={scene.stickman.speed ?? 1}
        strokeColor={strokeColor}
        props={scene.stickman.props ?? []}
      />

      <KineticText
        text={scene.narration_text}
        config={scene.visual_text}
        isDark={isDark}
      />
    </AbsoluteFill>
  );
};

export const MainComposition: React.FC<{ project: ProjectData }> = ({
  project,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const isDark = project?.project_meta?.theme !== "light_minimal";

  const bgStyle = isDark
    ? "radial-gradient(circle at 50% 38%, #18181B 0%, #09090B 68%, #050506 100%)"
    : "radial-gradient(circle at 50% 38%, #FFFFFF 0%, #F1F5F9 72%, #E2E8F0 100%)";

  const totalProgress =
    durationInFrames > 1 ? Math.min(1, frame / (durationInFrames - 1)) : 0;

  let currentStart = 0;

  return (
    <AbsoluteFill style={{ background: bgStyle, overflow: "hidden" }}>
      {/* Barra de progresso minimalista no topo */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 56,
          right: 56,
          height: 6,
          borderRadius: 999,
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(15, 23, 42, 0.12)",
          zIndex: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${totalProgress * 100}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: isDark ? "#FACC15" : "#2563EB",
          }}
        />
      </div>

      {(project?.scenes ?? []).map((scene) => {
        const sceneDuration = Math.max(
          1,
          Math.round((scene.duration_sec ?? 3.0) * fps)
        );
        const from = currentStart;
        currentStart += sceneDuration;

        return (
          <Sequence
            key={scene.scene_id}
            from={from}
            durationInFrames={sceneDuration}
          >
            <SceneView scene={scene} isDark={isDark} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
