
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "nss_treasurer",
  name: "NSS_Treasurer",
  isDev: process.env.NODE_ENV === "development" || !process.env.INNGEST_SIGNING_KEY,
});