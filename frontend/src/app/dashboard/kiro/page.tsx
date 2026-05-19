// This file redirects to the new KIRO route (uses (kiro) route group for standalone layout)
import { redirect } from "next/navigation";
export default function KIRORedirect() {
  redirect("/dashboard/kiro");
}
