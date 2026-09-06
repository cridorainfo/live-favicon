import type { PresetRenderer } from "../types";

const ALARM_COLOR = "#DC2626";

/**
 * A clock face with a fast-sweeping hand and a pulsing ring — reads as
 * urgent/time-based, distinct from notification's gentler expanding pulse.
 * For reminders, deadlines, and anything genuinely time-sensitive.
 */
export const renderAlarm: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  const ringAlpha = 0.6 + Math.sin(t * 10) * 0.4;
  ctx.strokeStyle = `rgba(220, 38, 38, ${Math.max(0, Math.min(1, ringAlpha))})`;
  ctx.lineWidth = size * 0.08;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = ALARM_COLOR;
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = "round";

  // Short hand at a fixed angle, like a clock's hour hand.
  const shortAngle = -Math.PI / 2 - 0.4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(shortAngle) * radius * 0.4, cy + Math.sin(shortAngle) * radius * 0.4);
  ctx.stroke();

  // Fast-sweeping hand — the ticking motion that reads as "time is moving."
  const sweepAngle = t * 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sweepAngle) * radius * 0.7, cy + Math.sin(sweepAngle) * radius * 0.7);
  ctx.stroke();

  ctx.fillStyle = ALARM_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
};
