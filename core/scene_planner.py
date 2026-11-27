from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

StickmanActionType = Literal[
    "idle",
    "run",
    "push_boulder_uphill",
    "climb_stairs",
    "celebrate_arms_up",
]
TextAnimationType = Literal["pop_impact", "typewriter_bold"]
TextPositionType = Literal["top_third", "center"]
CameraEffectType = Literal["slow_zoom_in", "zoom_out_reveal", "static"]
ThemeType = Literal["dark_minimal", "light_minimal"]


class Resolution(BaseModel):
    width: int = Field(default=1080, ge=360, le=3840)
    height: int = Field(default=1920, ge=640, le=3840)


class ProjectMeta(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    resolution: Resolution = Field(default_factory=Resolution)
    fps: int = Field(default=30, ge=24, le=60)
    theme: ThemeType = Field(default="dark_minimal")


class AudioConfig(BaseModel):
    bgm_track: Optional[str] = Field(default="assets/music/dark_motivational_01.mp3")
    bgm_volume: float = Field(default=0.15, ge=0.0, le=1.0)


class VisualTextConfig(BaseModel):
    highlight_words: list[str] = Field(default_factory=list)
    animation: TextAnimationType = Field(default="pop_impact")
    position: TextPositionType = Field(default="top_third")


class StickmanConfig(BaseModel):
    action: StickmanActionType = Field(default="run")
    speed: float = Field(default=1.0, gt=0.1, le=4.0)
    expression: str = Field(default="focused")
    props: list[str] = Field(default_factory=list)


class CameraConfig(BaseModel):
    effect: CameraEffectType = Field(default="slow_zoom_in")
    shake_intensity: float = Field(default=0.0, ge=0.0, le=1.0)


class SfxEvent(BaseModel):
    time_offset_sec: float = Field(ge=0.0)
    sound: str = Field(min_length=1)


class SceneItem(BaseModel):
    scene_id: int = Field(ge=1)
    duration_sec: Optional[float] = Field(default=None, gt=0.3, le=30.0)
    narration_text: str = Field(min_length=1)
    visual_text: VisualTextConfig = Field(default_factory=VisualTextConfig)
    stickman: StickmanConfig = Field(default_factory=StickmanConfig)
    camera: CameraConfig = Field(default_factory=CameraConfig)
    sfx: list[SfxEvent] = Field(default_factory=list)

    @field_validator("narration_text")
    @classmethod
    def clean_narration(cls, value: str) -> str:
        normalized = re.sub(r"\s+", " ", value).strip()
        if not normalized:
            raise ValueError("narration_text não pode ficar vazio.")
        return normalized

    @model_validator(mode="after")
    def validate_sfx_offsets(self) -> "SceneItem":
        if self.duration_sec is not None:
            for item in self.sfx:
                if item.time_offset_sec > self.duration_sec:
                    raise ValueError(
                        f"SFX '{item.sound}' na cena {self.scene_id} tem offset maior que a duração."
                    )
        return self


class ProjectPlan(BaseModel):
    project_meta: ProjectMeta
    audio: AudioConfig = Field(default_factory=AudioConfig)
    scenes: list[SceneItem] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_unique_scene_ids(self) -> "ProjectPlan":
        ids = [s.scene_id for s in self.scenes]
        if len(ids) != len(set(ids)):
            raise ValueError("Os valores de scene_id devem ser únicos.")
        return self


def estimate_duration_from_text(text: str, words_per_sec: float = 2.6, min_sec: float = 2.0) -> float:
    words = len(re.findall(r"\b\w+\b", text))
    pauses = text.count(".") * 0.25 + text.count(",") * 0.12 + text.count("!") * 0.2
    raw_sec = (words / words_per_sec) + pauses + 0.35
    return round(max(min_sec, math.ceil(raw_sec * 10) / 10), 2)


def plan_project(
    raw_project: dict,
    audio_durations_sec: Optional[dict[int, float]] = None,
    output_json_path: Optional[str | Path] = None,
) -> ProjectPlan:
    durations_map = audio_durations_sec or {}
    for idx, scene in enumerate(raw_project.get("scenes", []), start=1):
        scene_id = scene.get("scene_id", idx)
        if scene_id in durations_map:
            scene["duration_sec"] = round(float(durations_map[scene_id]), 2)
        elif scene.get("duration_sec") is None:
            scene["duration_sec"] = estimate_duration_from_text(scene.get("narration_text", ""))

    validated = ProjectPlan.model_validate(raw_project)
    if output_json_path is not None:
        out_path = Path(output_json_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(
            json.dumps(validated.model_dump(), indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    return validated
