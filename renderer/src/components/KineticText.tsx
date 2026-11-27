import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface VisualTextConfig {
  highlight_words?: string[];
  animation?: "pop_impact" | "typewriter_bold" | string;
  position?: "top_third" | "center" | "bottom_third" | string;
}

interface KineticTextProps {
  text: string;
  config?: VisualTextConfig;
  isDark: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  config,
  isDark,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const highlights = (config?.highlight_words ?? []).map((w) =>
    w.trim().toUpperCase()
  );
  const animType = config?.animation ?? "pop_impact";
  const posType = config?.position ?? "top_third";

  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const isHighlighted = (word: string) => {
    const clean = word
      .toUpperCase()
      .replace(/[.,!?;:"'()—-]/g, "");
    if (!clean) return false;
    return highlights.some(
      (h) =>
        h === clean ||
        clean.includes(h) ||
        h.split(/\s+/).includes(clean)
    );
  };

  let topStyle = "24%";
  if (posType === "center") topStyle = "40%";
  else if (posType === "bottom_third") topStyle = "66%";

  const baseTextColor = isDark ? "#F8FAFC" : "#0F172A";
  const accentBg = isDark ? "#FACC15" : "#2563EB";
  const accentText = isDark ? "#09090B" : "#FFFFFF";

  const staggerFrames =
    animType === "typewriter_bold"
      ? Math.max(2, Math.min(6, Math.floor((durationInFrames * 0.45) / Math.max(1, words.length))))
      : Math.max(2, Math.min(5, Math.floor((durationInFrames * 0.35) / Math.max(1, words.length))));

  return (
    <div
      style={{
        position: "absolute",
        top: topStyle,
        left: 64,
        right: 64,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 18,
        rowGap: 14,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {words.map((word, idx) => {
        const delay = idx * staggerFrames;
        const progress = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: {
            damping: 14,
            stiffness: 180,
            mass: 0.75,
          },
        });

        const active = isHighlighted(word);
        const scale = 0.82 + progress * 0.18;
        const translateY = (1 - progress) * 26;

        return (
          <span
            key={`${word}-${idx}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily:
                "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              fontWeight: active ? 900 : 800,
              fontSize: active ? 62 : 54,
              lineHeight: 1.08,
              letterSpacing: active ? "0.02em" : "0.01em",
              textTransform: "uppercase",
              opacity: progress,
              transform: `translateY(${translateY}px) scale(${scale})`,
              padding: active ? "6px 18px" : "4px 6px",
              borderRadius: active ? 12 : 6,
              backgroundColor: active ? accentBg : "transparent",
              color: active ? accentText : baseTextColor,
              boxShadow: active
                ? isDark
                  ? "0 10px 28px rgba(250, 204, 21, 0.28)"
                  : "0 10px 24px rgba(37, 99, 235, 0.25)"
                : "none",
              textShadow: active
                ? "none"
                : isDark
                ? "0 4px 18px rgba(0, 0, 0, 0.75)"
                : "0 2px 10px rgba(255, 255, 255, 0.8)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
