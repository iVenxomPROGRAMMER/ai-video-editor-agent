from __future__ import annotations

import asyncio
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import edge_tts


class AudioEngineError(RuntimeError):
    """Erro durante a geração ou medição de áudio."""


@dataclass
class NarrationResult:
    durations_by_scene: dict[int, float]
    scene_audio_files: dict[int, Path]
    combined_narration_path: Optional[Path]


def probe_audio_duration_sec(audio_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(audio_path.resolve()),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        raise AudioEngineError(f"Erro no ffprobe: {res.stderr.strip()}")
    return round(max(0.2, float(res.stdout.strip())), 2)


async def _synth_one(text: str, out_mp3: Path, voice: str, rate: str, pitch: str) -> None:
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch)
    await comm.save(str(out_mp3))


def concatenate_audio_files(audio_files: list[Path], output_wav: Path) -> Path:
    output_wav.parent.mkdir(parents=True, exist_ok=True)
    list_file = output_wav.parent / "concat_list.txt"
    list_file.write_text(
        "\n".join(f"file '{f.resolve().as_posix()}'" for f in audio_files),
        encoding="utf-8",
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_file.resolve()),
        "-ar",
        "48000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        str(output_wav.resolve()),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        raise AudioEngineError(f"Erro ao concatenar áudio: {res.stderr.strip()}")
    return output_wav


async def generate_narration_for_scenes_async(
    scenes: list[dict],
    audio_dir: Path,
    voice: str = "pt-BR-AntonioNeural",
    rate: str = "+5%",
    pitch: str = "-2Hz",
    padding_sec: float = 0.25,
    concat_output_wav: Optional[Path] = None,
) -> NarrationResult:
    audio_dir.mkdir(parents=True, exist_ok=True)
    durations_by_scene: dict[int, float] = {}
    scene_audio_files: dict[int, Path] = {}
    ordered: list[Path] = []

    for idx, scene in enumerate(scenes, start=1):
        scene_id = int(scene.get("scene_id", idx))
        text = str(scene.get("narration_text", "")).strip()
        if not text:
            continue
        mp3_path = audio_dir / f"scene_{scene_id:02d}.mp3"
        await _synth_one(text, mp3_path, voice, rate, pitch)
        durations_by_scene[scene_id] = round(probe_audio_duration_sec(mp3_path) + padding_sec, 2)
        scene_audio_files[scene_id] = mp3_path
        ordered.append(mp3_path)

    combined_path = (
        concatenate_audio_files(ordered, concat_output_wav)
        if (concat_output_wav and ordered)
        else None
    )
    return NarrationResult(durations_by_scene, scene_audio_files, combined_path)


def generate_narration_for_scenes(
    scenes: list[dict],
    audio_dir: Path,
    voice: str = "pt-BR-AntonioNeural",
    rate: str = "+5%",
    pitch: str = "-2Hz",
    padding_sec: float = 0.25,
    concat_output_wav: Optional[Path] = None,
) -> NarrationResult:
    return asyncio.run(
        generate_narration_for_scenes_async(
            scenes, audio_dir, voice, rate, pitch, padding_sec, concat_output_wav
        )
    )
