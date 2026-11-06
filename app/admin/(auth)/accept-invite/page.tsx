import type { Metadata } from "next";
import { AcceptInviteForm } from "@/components/admin/AcceptInviteForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
  return <AcceptInviteForm />;
}
