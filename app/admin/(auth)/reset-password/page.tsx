import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  // The emailed link carries a one-time token; never pass it on as a Referer.
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
