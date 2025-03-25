// src/app/terminal/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useUser, useAuth, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Terminal from "@/componenets/Terminal";
import DatabaseConnectionModal from "@/componenets/DatabaseConnectionModal";

export default function TerminalPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    } else if (isLoaded && user) {
      fetchConnections();
    }
  }, [user, isLoaded, router]);

  const fetchConnections = async () => {
    try {
      setLoading(true);

      // Get the authentication token from Clerk
      const token = await getToken();

      // Make the request to your FastAPI backend
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/connections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();

      // Show the modal if there are no connections
      if (!data || data.length === 0) {
        setShowConnectionModal(true);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError("Failed to check database connections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-green-500 text-2xl font-mono">
          Loading terminal...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-red-500 text-xl font-mono">{error}</div>
        <SignOutButton>
          <button
            onClick={fetchConnections}
            className="mt-4 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
          >
            Try Signing in
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Terminal />
      {showConnectionModal && (
        <DatabaseConnectionModal
          onClose={() => setShowConnectionModal(false)}
          onSuccess={fetchConnections}
        />
      )}
    </main>
  );
}
