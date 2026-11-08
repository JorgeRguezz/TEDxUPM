// Speeds are measured in contour circuits per second at the default 0.25× setting.
// These endpoints come from the former 18-circuit / 14-second animation.
export const contourMotion = {
  referenceSpeed: 0.25,
  startSpeed: (18 / 14) * 0.015,
  topSpeed: (18 / 14) * 1.985,
  rampSeconds: 0.9,
};

export function contourTurns(elapsedSeconds: number): number {
  const { startSpeed, topSpeed, rampSeconds } = contourMotion;
  const elapsed = Math.max(0, elapsedSeconds);
  const accelerating = Math.min(elapsed, rampSeconds);
  const u = accelerating / rampSeconds;
  // Integrate a smoothstep velocity ramp, then keep moving at the target speed.
  const rampDistance = startSpeed * accelerating
    + (topSpeed - startSpeed) * rampSeconds * (u ** 3 - 0.5 * u ** 4);
  return rampDistance + topSpeed * Math.max(0, elapsed - rampSeconds);
}
