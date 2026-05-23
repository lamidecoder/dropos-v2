"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomePage from "../components/HomePage";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hostname = window.location.hostname;
    // If on a subdomain like midelymah320.droposhq.com
    if (
      hostname !== ROOT_DOMAIN &&
      hostname !== `www.${ROOT_DOMAIN}` &&
      hostname.endsWith(`.${ROOT_DOMAIN}`)
    ) {
      const slug = hostname.replace(`.${ROOT_DOMAIN}`, "");
      // Hard redirect to store page
      window.location.href = `https://${ROOT_DOMAIN}/store/${slug}${window.location.pathname === "/" ? "" : window.location.pathname}`;
    }
  }, []);

  return <HomePage />;
}
