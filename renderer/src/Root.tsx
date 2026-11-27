import React from "react";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MainComposition, ProjectData } from "./Composition";

const defaultProject: ProjectData = {
  project_meta: {
    title: "Disciplina Todos os Dias",
    resolution: { width: 1080, height: 1920 },
    fps: 30,
    theme: "dark_minimal",
  },
  scenes: [
    {
      scene_id: 1,
      duration_sec: 3.2,
      narration_text: "Motivação some rápido. Disciplina fica.",
      visual_text: {
        highlight_words: ["DISCIPLINA", "FICA"],
        animation: "pop_impact",
        position: "top_third",
      },
      stickman: {
        action: "push_boulder_uphill",
        speed: 1.0,
        props: ["heavy_rock", "inclined_floor"],
      },
      camera: { effect: "slow_zoom_in", shake_intensity: 0.12 },
    },
  ],
};

const calculateMetadata: CalculateMetadataFunction<{ project: ProjectData }> = ({
  props,
}) => {
  const fps = props.project?.project_meta?.fps ?? 30;
  const width = props.project?.project_meta?.resolution?.width ?? 1080;
  const height = props.project?.project_meta?.resolution?.height ?? 1920;

  const totalFrames = (props.project?.scenes ?? []).reduce((sum, scene) => {
    const sceneFrames = Math.max(1, Math.round((scene.duration_sec ?? 3.0) * fps));
    return sum + sceneFrames;
  }, 0);

  return {
    durationInFrames: Math.max(1, totalFrames),
    fps,
    width,
    height,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComposition"
      component={MainComposition}
      durationInFrames={96}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ project: defaultProject }}
      calculateMetadata={calculateMetadata}
    />
  );
};
