"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inquiry");
  }, [router]);

  return <main style={{ padding: "2rem" }}>Mengalihkan ke form minat...</main>;
}
