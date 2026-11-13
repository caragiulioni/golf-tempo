// A tiny module-level event log shared by the main player hook (which writes to it)
// and the audio lab (which reads it). Lives here, not in the lab, so nothing but the
// lab mount needs to import the lab (R10.7). Newest line first.

/** The Copy log text keeps this many lines, so a long session is not cut off. */
export const LOG_LINES_KEPT = 300;

type Listener = () => void;

let lines: string[] = [];
const listeners = new Set<Listener>();

export function addLog(text: string): void {
  const time = new Date().toLocaleTimeString();
  lines = [`${time}  ${text}`, ...lines].slice(0, LOG_LINES_KEPT);
  listeners.forEach((listener) => listener());
}

/** Newest first. A new array each time a line is added, so it works with useSyncExternalStore. */
export function getLog(): readonly string[] {
  return lines;
}

/** Called after every added line. Returns a function that removes the listener. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
