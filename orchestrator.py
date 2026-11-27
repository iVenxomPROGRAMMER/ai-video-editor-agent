from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Optional

from core.audio_engine import generate_narration_for_scenes
from core.scene_planner import ProjectPlan, plan_project


class OrchestratorError(RuntimeError):
    """Erro na renderização ou mixagem."""


def run_cmd(cmd: list[str], cwd: Optional[Path] = None, step: str = "comando") -> None:
    res = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if res.returncode != 0:
        tail = "\n".join((res.stderr or "").strip().splitlines()[-15:])
        raise OrchestratorError(f"Falha em '{step}' (código {res.returncode}):\n{tail}")


def compute_total_frames(plan: ProjectPlan) -> int:
    fps = plan.project_meta.fps
    return max(1, sum(max(1, round((s.duration_sec or 2.0) * fps)) for s in plan.scenes))


def render_remotion(
    project_json_path: Path, renderer_dir: Path, out_mp4: Path, plan: ProjectPlan
) -> None:
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    total_frames = compute_total_frames(plan)
    props_str = json.dumps(
        {"project": json.loads(project_json_path.read_text(encoding="utf-8"))},
        ensure_ascii=False,
    )
    cmd = [
        "npx",
        "remotion",
        "render",
        "src/index.ts",
        "MainComposition",
        str(out_mp4.resolve()),
        "--props",
        props_str,
        "--frames",
        f"0-{total_frames - 1}",
        "--fps",
        str(plan.project_meta.fps),
        "--width",
        str(plan.project_meta.resolution.width),
        "--height",
        str(plan.project_meta.resolution.height),
        "--codec",
        "h264",
    ]
    run_cmd(cmd, cwd=renderer_dir, step="remotion render")


def mix_ffmpeg(
    silent_mp4: Path, final_mp4: Path, plan: ProjectPlan, root: Path, narration_wav: Optional[Path]
) -> None:
    final_mp4.parent.mkdir(parents=True, exist_ok=True)
    total_sec = sum((s.duration_sec or 2.0) for s in plan.scenes)
    inputs: list[str] = ["-i", str(silent_mp4.resolve())]
    filters: list[str] = []
    mix_in: list[str] = []
    idx = 1

    if narration_wav and narration_wav.exists():
        inputs.extend(["-i", str(narration_wav.resolve())])
        filters.append(f"[{idx}:a]aresample=48000,apad,atrim=0:{total_sec}[voice]")
        mix_in.append("[voice]")
        idx += 1

    bgm_path = (root / plan.audio.bgm_track).resolve() if plan.audio.bgm_track else None
    if bgm_path and bgm_path.exists():
        inputs.extend(["-stream_loop", "-1", "-i", str(bgm_path)])
        filters.append(
            f"[{idx}:a]aresample=48000,volume={plan.audio.bgm_volume},atrim=0:{total_sec},"
            f"afade=t=out:st={max(0.0, total_sec - 0.8)}:d=0.8[bgm]"
        )
        mix_in.append("[bgm]")
        idx += 1

    elapsed = 0.0
    sfx_i = 0
    for scene in plan.scenes:
        dur = scene.duration_sec or 2.0
        for sfx in scene.sfx:
            sfx_path = (root / sfx.sound).resolve()
            if not sfx_path.exists():
                continue
            delay_ms = int(round((elapsed + sfx.time_offset_sec) * 1000))
            lbl = f"[sfx{sfx_i}]"
            inputs.extend(["-i", str(sfx_path)])
            filters.append(
                f"[{idx}:a]aresample=48000,adelay={delay_ms}|{delay_ms},apad,atrim=0:{total_sec}{lbl}"
            )
            mix_in.append(lbl)
            sfx_i += 1
            idx += 1
        elapsed += dur

    cmd = ["ffmpeg", "-y", *inputs]
    if mix_in:
        filters.append(
            f"{''.join(mix_in)}amix=inputs={len(mix_in)}:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[aout]"
        )
        cmd.extend([
            "-filter_complex",
            ";".join(filters),
            "-map",
            "0:v:0",
            "-map",
            "[aout]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-movflags",
            "+faststart",
            str(final_mp4.resolve()),
        ])
    else:
        cmd.extend(["-c", "copy", "-movflags", "+faststart", str(final_mp4.resolve())])

    run_cmd(cmd, cwd=root, step="ffmpeg mixagem")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, default=Path("build/project.json"))
    parser.add_argument("--renderer-dir", type=Path, default=Path("renderer"))
    parser.add_argument("--build-dir", type=Path, default=Path("build"))
    parser.add_argument("--tts", action="store_true")
    parser.add_argument("--voice", type=str, default="pt-BR-AntonioNeural")
    args = parser.parse_args()

    root = Path.cwd()
    proj_path = (root / args.project).resolve()
    raw = json.loads(proj_path.read_text(encoding="utf-8"))

    durations = None
    narration_wav = None
    if args.tts:
        res = generate_narration_for_scenes(
            scenes=raw.get("scenes", []),
            audio_dir=(root / args.build_dir / "audio_scenes").resolve(),
            voice=args.voice,
            concat_output_wav=(root / args.build_dir / "narration_full.wav").resolve(),
        )
        durations = res.durations_by_scene
        narration_wav = res.combined_narration_path

    plan = plan_project(raw, audio_durations_sec=durations, output_json_path=proj_path)
    silent_mp4 = (root / args.build_dir / "remotion_silent.mp4").resolve()
    final_mp4 = (root / args.build_dir / "final_reel.mp4").resolve()

    render_remotion(proj_path, (root / args.renderer_dir).resolve(), silent_mp4, plan)
    mix_ffmpeg(silent_mp4, final_mp4, plan, root, narration_wav)
    print(f"Pronto: {final_mp4}")


if __name__ == "__main__":
    main()
