/**
 * Manages a single, controlled <link rel="icon"> element so we never create
 * duplicate favicons or fight with an application's own favicon management.
 *
 * On first use we adopt the page's existing icon link (if any), remember its
 * original href/rel so reset() can restore it exactly, and tag it with
 * data-live-favicon="true" so later calls find the same element.
 */

const MARKER_ATTR = "data-live-favicon";

let linkEl: HTMLLinkElement | null = null;
let originalHref: string | null = null;
let originalRel: string | null = null;
let adopted = false;

function ensureLink(): HTMLLinkElement | null {
  if (typeof document === "undefined") return null;

  if (linkEl && document.head.contains(linkEl)) return linkEl;

  const existing = document.querySelector<HTMLLinkElement>(`link[${MARKER_ATTR}="true"]`);
  if (existing) {
    linkEl = existing;
    return linkEl;
  }

  const prior = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (prior) {
    originalHref = prior.getAttribute("href");
    originalRel = prior.getAttribute("rel");
    linkEl = prior;
    adopted = true;
  } else {
    linkEl = document.createElement("link");
    linkEl.rel = "icon";
    document.head.appendChild(linkEl);
    adopted = false;
  }

  linkEl.setAttribute(MARKER_ATTR, "true");
  return linkEl;
}

export function setFaviconDataUrl(dataUrl: string): void {
  const link = ensureLink();
  if (!link) return;
  link.setAttribute("type", "image/png");
  link.href = dataUrl;
}

export function resetFavicon(): void {
  if (!linkEl) return;

  if (adopted && originalHref !== null) {
    linkEl.href = originalHref;
    if (originalRel !== null) linkEl.rel = originalRel;
    linkEl.removeAttribute(MARKER_ATTR);
  } else if (!adopted) {
    linkEl.remove();
  } else {
    // Adopted a link that had no href originally; just drop our marker/type.
    linkEl.removeAttribute(MARKER_ATTR);
    linkEl.removeAttribute("href");
  }

  linkEl = null;
  originalHref = null;
  originalRel = null;
  adopted = false;
}
