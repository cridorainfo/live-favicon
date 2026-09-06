let originalTitle: string | null = null;

export function setTitle(text: string): void {
  if (typeof document === "undefined") return;
  if (originalTitle === null) originalTitle = document.title;
  document.title = text;
}

export function resetTitle(): void {
  if (typeof document === "undefined") return;
  if (originalTitle !== null) {
    document.title = originalTitle;
    originalTitle = null;
  }
}
