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
  const [pendingConnection, setPendingConnection] = useState(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    } else if (isLoaded && user) {
      checkConnections();
    }
  }, [user, isLoaded, router]);

  const checkConnections = async () => {
    try {
      setLoading(true);

      // Get the authentication token from Clerk
      const token = await getToken();

      // Make the request to your FastAPI backend
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/connections/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const connections = await response.json();

      // If no connections exist, show the modal to create one
      if (!connections || connections.length === 0) {
        setShowConnectionModal(true);
        setPendingConnection(null);
        setLoading(false);
        return;
      }

      // Check if any connection is in 'pending' or 'processing' state
      const pendingConn = connections.find(
        (conn) =>
          conn.schema_status === "pending" ||
          conn.schema_status === "processing"
      );

      if (pendingConn) {
        // Show extraction status modal for the pending connection
        setPendingConnection(pendingConn);
        setShowConnectionModal(true);
      } else {
        // All connections are either completed or failed
        setPendingConnection(null);
        setShowConnectionModal(false);
      }
    } catch (err) {
      console.error("Error checking connections:", err);
      setError("Failed to check database connections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionSuccess = () => {
    checkConnections();
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
            onClick={checkConnections}
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
          onSuccess={handleConnectionSuccess}
          pendingConnection={pendingConnection}
        />
      )}
    </main>
  );
}
