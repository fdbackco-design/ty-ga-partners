import { getApplicationByUserId, isIssued } from "@/lib/partnerApplicationsStore";
import { getViewer } from "@/lib/viewer";

export type ResourceAccess = {
  loggedIn: boolean;
  isAdmin: boolean;
  canView: boolean;
  canDownload: boolean;
};

export async function getResourceAccess(): Promise<ResourceAccess> {
  const viewer = await getViewer();
  if (!viewer) {
    return { loggedIn: false, isAdmin: false, canView: false, canDownload: false };
  }
  if (viewer.isAdmin) {
    return { loggedIn: true, isAdmin: true, canView: true, canDownload: true };
  }
  try {
    const application = await getApplicationByUserId(viewer.username);
    return {
      loggedIn: true,
      isAdmin: false,
      canView: true,
      canDownload: isIssued(application),
    };
  } catch {
    return { loggedIn: true, isAdmin: false, canView: true, canDownload: false };
  }
}
