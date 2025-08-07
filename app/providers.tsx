"use client";

import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  const clientId = process.env.NEXT_PUBLIC_CAMP_CLIENT_ID;

  if (!clientId) {
    console.error("NEXT_PUBLIC_CAMP_CLIENT_ID is not set in environment variables");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">Camp Network client ID is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId={clientId}
        redirectUri={
          typeof window !== "undefined" ? window.location.origin : ""
        }
        allowAnalytics={true}
      >
        {children}
      </CampProvider>
    </QueryClientProvider>
  );
}
