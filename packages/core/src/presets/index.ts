import type { BuiltInFaviconState, PresetRenderer } from "../types";
import { renderThinking } from "./thinking";
import { renderLoading, renderProcessing, renderSyncing, renderPayment } from "./spinner";
import { renderReconnecting } from "./reconnecting";
import { renderUploading } from "./upload";
import { renderDownloading } from "./download";
import { renderSuccess } from "./success";
import { renderError } from "./error";
import { renderWarning } from "./warning";
import { renderOffline } from "./offline";
import { renderNotification } from "./notification";
import { renderMention } from "./mention";
import { renderMessage } from "./message";
import { renderAlarm } from "./alarm";
import { renderCelebration } from "./celebration";
import { renderQueue } from "./queue";

export type AnimatedState = Exclude<BuiltInFaviconState, "idle">;

export interface Preset {
  render: PresetRenderer;
  /** Whether this preset needs a running scheduler, vs. a single static frame. */
  animated: boolean;
  /** For pop-in states: stop the scheduler this long after activation. */
  settleAfterMs?: number;
  /**
   * Sound to play each time this state activates: `true` for the built-in
   * synthesized chime, or a URL to play a custom audio file instead. Gated
   * by the global `favicon.sound()` toggle. Only settable via
   * `favicon.define()` — built-in states don't ship a default sound.
   */
  sound?: boolean | string;
}

export const presets: Record<AnimatedState, Preset> = {
  thinking: { render: renderThinking, animated: true },
  loading: { render: renderLoading, animated: true },
  processing: { render: renderProcessing, animated: true },
  syncing: { render: renderSyncing, animated: true },
  reconnecting: { render: renderReconnecting, animated: true },
  uploading: { render: renderUploading, animated: true },
  downloading: { render: renderDownloading, animated: true },
  notification: { render: renderNotification, animated: true },
  mention: { render: renderMention, animated: true },
  message: { render: renderMessage, animated: true },
  success: { render: renderSuccess, animated: true, settleAfterMs: 500 },
  error: { render: renderError, animated: true, settleAfterMs: 450 },
  warning: { render: renderWarning, animated: false },
  offline: { render: renderOffline, animated: false },
  alarm: { render: renderAlarm, animated: true },
  celebration: { render: renderCelebration, animated: true },
  payment: { render: renderPayment, animated: true },
  queue: { render: renderQueue, animated: true },
};

export { makeProgress } from "./progress";
export { spinner, pulse, iconBadge } from "./kit";
