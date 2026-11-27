# SKILL: AI Video Editor Agent

Gera vídeos motivacionais `9:16` (`1080x1920`, `30 fps`) com stickman articulado em SVG, texto cinético, locução via `edge-tts` e mixagem via `FFmpeg`.

## Fluxo
1. Estruturar cenas curtas no contrato `project.json`.
2. Gerar locução e durações reais com `core/audio_engine.py`.
3. Validar e salvar `build/project.json` com `core/scene_planner.py`.
4. Renderizar via Remotion e mixar áudio com `orchestrator.py`.

## Integração com Freebuff
* Respeite `AGENTS.md` e este `SKILL.md` em toda sessão no repositório.
* Ao criar novas poses em `renderer/src/animations/poses.ts`, atualize também `core/scene_planner.py` e `SKILL.md`.
