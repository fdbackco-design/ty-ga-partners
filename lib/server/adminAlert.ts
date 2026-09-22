import "server-only";

import { redactSecrets } from "@/lib/log";

export async function notifyAdminAlert(text: string) {
  const url = process.env.ADMIN_ALERT_WEBHOOK;
  if (!url) {
    console.error("[admin-alert]", redactSecrets(text));
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: redactSecrets(text) }),
    });
  } catch (error) {
    console.error("[admin-alert] webhook failed", error);
  }
}
