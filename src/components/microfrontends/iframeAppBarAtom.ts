import { atom } from "jotai";

export type IframeAppBarState = {
  title?: string;
} | null;

/**
 * Holds the app bar state posted by the currently active iframe sub-app.
 * `null` means no iframe is controlling the app bar (use route static data).
 */
export const iframeAppBarAtom = atom<IframeAppBarState>(null);
