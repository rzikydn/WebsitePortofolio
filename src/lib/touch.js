// Shared touch primitives from beui.dev

export const TOUCH_GESTURE_CLASS = "select-none";

export const TOUCH_GESTURE_CONTENT_CLASS = "select-none";

export function holdSelection(element) {
  if (!element) return () => {};
  element.style.setProperty("user-select", "none");
  element.style.setProperty("-webkit-user-select", "none");
  return () => {
    element.style.removeProperty("user-select");
    element.style.removeProperty("-webkit-user-select");
  };
}

export function capturePointer(element, pointerId) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

export function releasePointer(element, pointerId) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}

export const isHoveringPointer = (event) =>
  event.pointerType !== "touch" && event.buttons === 0;
