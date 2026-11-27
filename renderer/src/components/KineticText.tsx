import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type TextAnimationType = "pop_impact" | "typewriter_bold";
export type TextPositionType = "top_third" | "center";

export interface VisualTextConfig {
  highlight_words?: string[];
  animation?: TextAnimationType;
  position?: TextPositionType;
}

interface KineticTextProps {
  text: string;
  config?: VisualTextConfig;
  isDark?: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  config,
  isDark = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = config?.animation ?? "pop_impact";
  const position = config?.position ?? "top_third";
  const highlights = (config?.highlight_words ?? []).map((w) => w.toUpperCase());

  const words = text.trim().split(/\s+/);
  const fgColor = isDark ? "#FFFFFF" : "#0B0B0C";
  const highlightColor = isDark ? "#FACC15" : "#D97706";
  const topOffset = position === "center" ? 560 : 280;

  return (
    <div
      style={{
        position: "absolute",
        top: topOffset,
        left: 72,
        right: 72,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        gap: "14px 18px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.12,
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
        textAlign: "center",
        zIndex: 10,
      }}
    >
      {words.map((word, index) => {
        const cleanWord = word.replace(/[.,!?;:"]/g, "").toUpperCase();
        const isHighlighted = highlights.some(
          (h) => cleanWord.includes(h) || h.includes(cleanWord)
        );
        const delayFrames = index * 3;
        const localFrame = Math.max(0, frame - delayFrames);

        let scale = 1;
        let opacity = 1;
        let translateY = 0;

        if (animation === "pop_impact") {
          const pop = spring({
            frame: localFrame,
            fps,
            config: { damping: 12, stiffness: 220, mass: 0.7 },
          });
          scale = interpolate(pop, [0, 1], [0.4, isHighlighted ? 1.12 : 1]);
          opacity = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
          translateY = interpolate(pop, [0, 1], [28, 0]);
        } else {
          opacity = localFrame > 0 ? 1 : 0;
          translateY = interpolate(localFrame, [0, 6], [12, 0], { extrapolateRight: "clamp" });
        }

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              color: isHighlighted ? highlightColor : fgColor,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              textShadow: isDark
                ? "0 6px 24px rgba(0, 0, 0, 0.75)"
                : "0 4px 16px rgba(255, 255, 255, 0.85)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
