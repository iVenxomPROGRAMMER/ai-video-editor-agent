{
  "project_meta": {
    "title": "Disciplina Todos os Dias",
    "resolution": { "width": 1080, "height": 1920 },
    "fps": 30,
    "theme": "dark_minimal"
  },
  "audio": {
    "bgm_track": "assets/music/dark_motivational_01.mp3",
    "bgm_volume": 0.14
  },
  "scenes": [
    {
      "scene_id": 1,
      "duration_sec": 3.2,
      "narration_text": "Motivação some rápido. Disciplina fica.",
      "visual_text": {
        "highlight_words": ["DISCIPLINA", "FICA"],
        "animation": "pop_impact",
        "position": "top_third"
      },
      "stickman": {
        "action": "idle",
        "speed": 0.9,
        "expression": "focused",
        "props": []
      },
      "camera": { "effect": "slow_zoom_in", "shake_intensity": 0.0 },
      "sfx": []
    },
    {
      "scene_id": 2,
      "duration_sec": 3.8,
      "narration_text": "Todo dia você empurra um peso que ninguém vê.",
      "visual_text": {
        "highlight_words": ["TODO DIA", "PESO"],
        "animation": "pop_impact",
        "position": "top_third"
      },
      "stickman": {
        "action": "push_boulder_uphill",
        "speed": 1.0,
        "expression": "determined",
        "props": ["heavy_rock", "inclined_floor"]
      },
      "camera": { "effect": "slow_zoom_in", "shake_intensity": 0.15 },
      "sfx": [{ "time_offset_sec": 0.6, "sound": "assets/sfx/heavy_footstep.wav" }]
    },
    {
      "scene_id": 3,
      "duration_sec": 3.5,
      "narration_text": "Um degrau por vez constrói o que parece impossível.",
      "visual_text": {
        "highlight_words": ["DEGRAU", "IMPOSSÍVEL"],
        "animation": "typewriter_bold",
        "position": "top_third"
      },
      "stickman": {
        "action": "climb_stairs",
        "speed": 1.15,
        "expression": "focused",
        "props": ["stairs"]
      },
      "camera": { "effect": "slow_zoom_in", "shake_intensity": 0.05 },
      "sfx": []
    },
    {
      "scene_id": 4,
      "duration_sec": 3.2,
      "narration_text": "No topo, o esforço vira resultado.",
      "visual_text": {
        "highlight_words": ["TOPO", "RESULTADO"],
        "animation": "pop_impact",
        "position": "top_third"
      },
      "stickman": {
        "action": "celebrate_arms_up",
        "speed": 1.2,
        "expression": "triumph",
        "props": ["summit_peak", "light_rays"]
      },
      "camera": { "effect": "zoom_out_reveal", "shake_intensity": 0.0 },
      "sfx": [{ "time_offset_sec": 0.15, "sound": "assets/sfx/whoosh_impact.wav" }]
    }
  ]
}
