"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TY_CERT_URL, tyCertOrigin } from "@/lib/partnerCert";

export type NiceCertStatus = "idle" | "pending" | "blocked" | "cancelled" | "timeout" | "inapp-stale";

const CERT_TIMEOUT_MS = 5 * 60 * 1000;
const INAPP_STALE_MS = 3 * 60 * 1000;
const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 720;

type Timers = {
  watch?: number;
  timeout?: number;
  stale?: number;
};

export function useNiceCert(onResult: (payload: unknown) => Promise<void>) {
  const [status, setStatus] = useState<NiceCertStatus>("idle");
  const popupRef = useRef<Window | null>(null);
  const receivedRef = useRef(false);
  const handlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const timersRef = useRef<Timers>({});
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const cleanup = useCallback((closePopup = true) => {
    const timers = timersRef.current;
    if (timers.watch) window.clearInterval(timers.watch);
    if (timers.timeout) window.clearTimeout(timers.timeout);
    if (timers.stale) window.clearTimeout(timers.stale);
    timersRef.current = {};
    if (handlerRef.current) {
      window.removeEventListener("message", handlerRef.current);
      handlerRef.current = null;
    }
    if (closePopup && popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  const start = useCallback(() => {
    cleanup();
    receivedRef.current = false;

    const left = Math.round(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2);
    const popup = window.open(
      TY_CERT_URL,
      "tyCert",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes`,
    );
    if (!popup) {
      setStatus("blocked");
      return false;
    }

    popupRef.current = popup;
    setStatus("pending");

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== tyCertOrigin()) return;
      const data = event.data as { action?: string; payload?: unknown } | null;
      if (!data || data.action !== "AUTH_RESULT" || !data.payload) return;
      receivedRef.current = true;
      popup.close();
      cleanup(false);
      void onResultRef.current(data.payload);
    };
    handlerRef.current = onMessage;
    window.addEventListener("message", onMessage);

    timersRef.current.watch = window.setInterval(() => {
      if (popup.closed) {
        cleanup(false);
        if (!receivedRef.current) setStatus("cancelled");
      }
    }, 500);

    timersRef.current.timeout = window.setTimeout(() => {
      if (!receivedRef.current) {
        cleanup(true);
        setStatus("timeout");
      }
    }, CERT_TIMEOUT_MS);

    timersRef.current.stale = window.setTimeout(() => {
      if (!receivedRef.current) setStatus("inapp-stale");
    }, INAPP_STALE_MS);

    return true;
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { status, start, cleanup, setStatus };
}
