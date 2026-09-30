import { alreadyIssuedLoginMessage } from "@/lib/partnerCert";
import { getIssuedApplicationByDi } from "@/lib/partnerApplicationsStore";
import { findUserById } from "@/lib/usersStore";

export async function alreadyIssuedMessageForUserId(userId?: string | null) {
  if (!userId) return alreadyIssuedLoginMessage();
  const owner = await findUserById(userId);
  return alreadyIssuedLoginMessage(owner?.username);
}

export async function alreadyIssuedMessageForDi(di?: string | null) {
  if (!di) return alreadyIssuedLoginMessage();
  const issued = await getIssuedApplicationByDi(di);
  return alreadyIssuedMessageForUserId(issued?.userId);
}
