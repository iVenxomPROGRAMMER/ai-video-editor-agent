export type StickmanAction =
  | "idle"
  | "run"
  | "push_boulder_uphill"
  | "climb_stairs"
  | "celebrate_arms_up";

export interface StickmanPose {
  pelvisX: number;
  pelvisY: number;
  torsoAngle: number;
  headAngle: number;
  leftShoulder: number;
  leftElbow: number;
  rightShoulder: number;
  rightElbow: number;
  leftHip: number;
  leftKnee: number;
  rightHip: number;
  rightKnee: number;
}

export function getStickmanPose(
  action: StickmanAction,
  timeSec: number,
  speed = 1.0
): StickmanPose {
  const t = timeSec * speed;

  switch (action) {
    case "run": {
      const freq = t * 11;
      const cycle = Math.sin(freq);
      const kneeL = Math.max(0, Math.sin(freq + Math.PI * 0.5)) * 85;
      const kneeR = Math.max(0, Math.sin(freq - Math.PI * 0.5)) * 85;
      return {
        pelvisX: 0,
        pelvisY: -Math.abs(Math.cos(freq)) * 18,
        torsoAngle: 18,
        headAngle: -10,
        leftShoulder: -cycle * 55,
        leftElbow: -45 - Math.max(0, cycle) * 35,
        rightShoulder: cycle * 55,
        rightElbow: -45 - Math.max(0, -cycle) * 35,
        leftHip: cycle * 45,
        leftKnee: -kneeL,
        rightHip: -cycle * 45,
        rightKnee: -kneeR,
      };
    }
    case "push_boulder_uphill": {
      const freq = t * 6.5;
      const cycle = Math.sin(freq);
      const pushPulse = Math.abs(Math.sin(freq)) * 6;
      return {
        pelvisX: 0,
        pelvisY: -pushPulse,
        torsoAngle: 42,
        headAngle: -28,
        leftShoulder: -78 + cycle * 8,
        leftElbow: -15,
        rightShoulder: -82 - cycle * 8,
        rightElbow: -15,
        leftHip: 25 + cycle * 24,
        leftKnee: -35 - Math.max(0, cycle) * 35,
        rightHip: 25 - cycle * 24,
        rightKnee: -35 - Math.max(0, -cycle) * 35,
      };
    }
    case "climb_stairs": {
      const freq = t * 7.5;
      const cycle = Math.sin(freq);
      return {
        pelvisX: 0,
        pelvisY: -Math.abs(cycle) * 14,
        torsoAngle: 14,
        headAngle: -8,
        leftShoulder: -cycle * 40,
        leftElbow: -50,
        rightShoulder: cycle * 40,
        rightElbow: -50,
        leftHip: -30 + cycle * 35,
        leftKnee: -45 - Math.max(0, cycle) * 45,
        rightHip: -30 - cycle * 35,
        rightKnee: -45 - Math.max(0, -cycle) * 45,
      };
    }
    case "celebrate_arms_up": {
      const jumpPhase = Math.min(1, t * 2.5);
      const bounce =
        jumpPhase < 1 ? Math.sin(jumpPhase * Math.PI) * -55 : Math.sin(t * 8) * 6;
      return {
        pelvisX: 0,
        pelvisY: bounce,
        torsoAngle: -8,
        headAngle: -12,
        leftShoulder: -155 + Math.sin(t * 10) * 8,
        leftElbow: -15,
        rightShoulder: -155 - Math.sin(t * 10) * 8,
        rightElbow: -15,
        leftHip: 10,
        leftKnee: -12,
        rightHip: -10,
        rightKnee: -12,
      };
    }
    case "idle":
    default: {
      const breath = Math.sin(t * 3) * 4;
      return {
        pelvisX: 0,
        pelvisY: breath,
        torsoAngle: 2,
        headAngle: Math.sin(t * 1.5) * 4,
        leftShoulder: 8 + breath,
        leftElbow: -20,
        rightShoulder: -8 - breath,
        rightElbow: -20,
        leftHip: 4,
        leftKnee: -6,
        rightHip: -4,
        rightKnee: -6,
      };
    }
  }
}
