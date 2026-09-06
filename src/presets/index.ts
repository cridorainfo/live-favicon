import type { FaviconState, PresetRenderer } from "../types";
import { renderThinking } from "./thinking";
import { renderLoading, renderProcessing, renderSyncing } from "./spinner";
import { renderSuccess } from "./success";
import { renderError } from "./error";
import { renderWarning } from "./warning";
import { renderOffline } from "./offline";
import { renderNotification } from "./notification";

export type AnimatedState = Exclude<FaviconState, "idle">;

interface Preset {
  render: PresetRenderer;
  /** Whether this preset needs a running scheduler, vs. a single static frame. */
  animated: boolean;
  /** For pop-in states: stop the scheduler this long after activation. */
  settleAfterMs?: number;
}

export const presets: Record<AnimatedState, Preset> = {
  thinking: { render: renderThinking, animated: true },
  loading: { render: renderLoading, animated: true },
  processing: { render: renderProcessing, animated: true },
  syncing: { render: renderSyncing, animated: true },
  notification: { render: renderNotification, animated: true },
  success: { render: renderSuccess, animated: true, settleAfterMs: 500 },
  error: { render: renderError, animated: true, settleAfterMs: 450 },
  warning: { render: renderWarning, animated: false },
  offline: { render: renderOffline, animated: false },
};

export { makeProgress } from "./progress";
