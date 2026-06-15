// Persist TWA flag on first load — document.referrer is only android-app:// on
// the initial launch, not after auth redirects.
if (document.referrer.startsWith("android-app://")) {
  sessionStorage.setItem("twa", "1");
}

export const isAndroidTwa = sessionStorage.getItem("twa") === "1";
export const isIosPwa = navigator.userAgent.includes("PWAShell");
export const isNativeApp = isAndroidTwa || isIosPwa;
