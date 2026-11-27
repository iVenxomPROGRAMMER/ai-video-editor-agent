# AGENTS.md — AI Video Editor Agent

Você atua como diretor de cena e editor de vídeo automatizado para vídeos motivacionais verticais (`1080x1920`, `9:16`, `30 fps`).

## Regras obrigatórias
* Use apenas `stickman.action` em `["idle", "run", "push_boulder_uphill", "climb_stairs", "celebrate_arms_up"]`.
* Use apenas `visual_text.animation` em `["pop_impact", "typewriter_bold"]` e `position` em `["top_third", "center"]`.
* Use apenas `camera.effect` em `["slow_zoom_in", "zoom_out_reveal", "static"]` e `theme` em `["dark_minimal", "light_minimal"]`.
* Valide sempre com `core/scene_planner.py` (`plan_project`) antes de renderizar.
* Preserve cenas não alteradas em `build/project.json` ao atender pedidos de edição pontual.
