"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider
      // Provide a base URL to prevent Invalid URL errors
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}
