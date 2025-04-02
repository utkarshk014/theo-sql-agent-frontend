// // src/components/DatabaseConnectionModal.tsx
// "use client";

// import { useState } from "react";
// // import { useRouter } from 'next/navigation';
// import { useAuth } from "@clerk/nextjs";

// interface DatabaseConnectionModalProps {
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function DatabaseConnectionModal({
//   onClose,
//   onSuccess,
// }: DatabaseConnectionModalProps) {
//   const [name, setName] = useState("");
//   const [vectorDbUrl, setVectorDbUrl] = useState("");
//   const [targetDbUrl, setTargetDbUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { getToken } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!name || !vectorDbUrl || !targetDbUrl) {
//       setError("All fields are required");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       // Get the token for authentication with your backend
//       const token = await getToken();

//       // Make the request to your FastAPI backend
//       const backendUrl =
//         process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//       const response = await fetch(`${backendUrl}/api/connections/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name,
//           vector_db_url: vectorDbUrl,
//           target_db_url: targetDbUrl,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to create connection");
//       }

//       // Handle success
//       onSuccess();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//       <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 w-full max-w-md mx-4">
//         <h2 className="text-xl text-green-500 font-mono mb-4">
//           Database Connection Required
//         </h2>
//         <p className="text-green-400 mb-4">
//           To use THEO, you need to provide database connections:
//         </p>

//         {error && (
//           <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-green-400 mb-1">Connection Name</label>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//               placeholder="My Database"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-green-400 mb-1">
//               Vector Database URL
//             </label>
//             <input
//               type="text"
//               value={vectorDbUrl}
//               onChange={(e) => setVectorDbUrl(e.target.value)}
//               className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//               placeholder="postgresql://username:password@localhost:5432/vector_db"
//             />
//             <p className="text-gray-500 text-xs mt-1">
//               This database will store the schema embeddings
//             </p>
//           </div>

//           <div className="mb-6">
//             <label className="block text-green-400 mb-1">
//               Target Database URL
//             </label>
//             <input
//               type="text"
//               value={targetDbUrl}
//               onChange={(e) => setTargetDbUrl(e.target.value)}
//               className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//               placeholder="postgresql://username:password@localhost:5432/target_db"
//             />
//             <p className="text-gray-500 text-xs mt-1">
//               This is the database you want to query
//             </p>
//           </div>

//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50"
//             >
//               {loading ? "Saving..." : "Save Connection"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/components/DatabaseConnectionModal.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/nextjs";

// interface DatabaseConnectionModalProps {
//   onClose: () => void;
//   onSuccess: () => void;
// }

// // Status response type
// interface SchemaExtractionStatus {
//   status: string;
//   connection_id?: string;
//   error?: string;
//   details?: {
//     tables_processed?: number;
//     embeddings_created?: number;
//   };
//   progress?: number;
// }

// export default function DatabaseConnectionModal({
//   onClose,
//   onSuccess,
// }: DatabaseConnectionModalProps) {
//   const [name, setName] = useState("");
//   const [vectorDbUrl, setVectorDbUrl] = useState("");
//   const [targetDbUrl, setTargetDbUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [extractionStatus, setExtractionStatus] =
//     useState<SchemaExtractionStatus | null>(null);
//   const [isPolling, setIsPolling] = useState(false);
//   const { getToken } = useAuth();

//   const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//   const checkExtractionStatus = async () => {
//     try {
//       const token = await getToken();
//       const response = await fetch(
//         `${backendUrl}/api/connections/extraction/status`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to check extraction status");
//       }

//       const data = await response.json();
//       setExtractionStatus(data);

//       // Stop polling if completed or failed
//       if (data.status === "completed" || data.status === "failed") {
//         setIsPolling(false);

//         if (data.status === "completed") {
//           // Call onSuccess to refresh connections list
//           onSuccess();
//         }
//       }
//     } catch (err) {
//       console.error("Error checking status:", err);
//       setError(err instanceof Error ? err.message : "Failed to check status");
//       setIsPolling(false);
//     }
//   };

//   // Set up polling effect
//   useEffect(() => {
//     if (!isPolling) return;

//     // Check immediately once
//     checkExtractionStatus();

//     // Then set up interval
//     const intervalId = setInterval(checkExtractionStatus, 2000);

//     // Clean up
//     return () => clearInterval(intervalId);
//   }, [isPolling]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!name || !vectorDbUrl || !targetDbUrl) {
//       setError("All fields are required");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       // Get the token for authentication with your backend
//       const token = await getToken();

//       // Make the request to your FastAPI backend
//       const response = await fetch(`${backendUrl}/api/connections/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name,
//           vector_db_url: vectorDbUrl,
//           target_db_url: targetDbUrl,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to create connection");
//       }

//       // Start polling for extraction status
//       setIsPolling(true);
//       setLoading(false);

//       // Don't close the modal yet - we'll show extraction progress
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       setLoading(false);
//     }
//   };

//   const handleRetry = async () => {
//     if (!extractionStatus?.connection_id) {
//       setError("Cannot retry: Connection ID is not available");
//       return;
//     }

//     setError("");

//     try {
//       const token = await getToken();
//       const response = await fetch(
//         `${backendUrl}/api/connections/${extractionStatus.connection_id}/extract`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to retry extraction");
//       }

//       // Reset status and start polling again
//       setExtractionStatus({
//         status: "pending",
//         progress: 0,
//       });
//       setIsPolling(true);
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Failed to retry extraction"
//       );
//     }
//   };

//   const renderStatusContent = () => {
//     if (!extractionStatus) return null;

//     switch (extractionStatus.status) {
//       case "pending":
//       case "processing":
//         return (
//           <div className="mb-6">
//             <h3 className="text-green-400 font-mono mb-2">
//               {extractionStatus.status === "pending"
//                 ? "Preparing to extract schema..."
//                 : "Extracting schema and generating embeddings..."}
//             </h3>
//             <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
//               <div
//                 className="bg-green-500 h-full transition-all duration-300 ease-in-out"
//                 style={{ width: `${extractionStatus.progress || 0}%` }}
//               ></div>
//             </div>
//             <p className="text-gray-400 text-xs mt-1">
//               {extractionStatus.progress || 0}% complete
//             </p>
//           </div>
//         );

//       case "completed":
//         return (
//           <div className="mb-6 bg-green-900/30 border border-green-700 p-4 rounded">
//             <h3 className="text-green-400 font-mono mb-2">
//               Schema extraction completed!
//             </h3>
//             {extractionStatus.details && (
//               <div className="text-green-300 text-sm mb-2">
//                 <p>
//                   Tables processed: {extractionStatus.details.tables_processed}
//                 </p>
//                 <p>
//                   Embeddings created:{" "}
//                   {extractionStatus.details.embeddings_created}
//                 </p>
//               </div>
//             )}
//             <button
//               onClick={() => {
//                 onSuccess();
//                 onClose();
//               }}
//               className="mt-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
//             >
//               Continue to Terminal
//             </button>
//           </div>
//         );

//       case "failed":
//         return (
//           <div className="mb-6 bg-red-900/30 border border-red-700 p-4 rounded">
//             <h3 className="text-red-400 font-mono mb-2">
//               Schema extraction failed
//             </h3>
//             {extractionStatus.error && (
//               <p className="text-red-300 text-sm mb-2">
//                 {extractionStatus.error}
//               </p>
//             )}
//             <div className="flex space-x-3">
//               <button
//                 onClick={handleRetry}
//                 className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600"
//               >
//                 Retry Extraction
//               </button>
//               <button
//                 onClick={onClose}
//                 className="mt-2 px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//       <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 w-full max-w-md mx-4">
//         <h2 className="text-xl text-green-500 font-mono mb-4">
//           {!extractionStatus
//             ? "Database Connection Required"
//             : "Schema Extraction"}
//         </h2>

//         {!extractionStatus ? (
//           <>
//             <p className="text-green-400 mb-4">
//               To use THEO, you need to provide database connections:
//             </p>

//             {error && (
//               <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-green-400 mb-1">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//                   placeholder="My Database"
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="block text-green-400 mb-1">
//                   Vector Database URL
//                 </label>
//                 <input
//                   type="text"
//                   value={vectorDbUrl}
//                   onChange={(e) => setVectorDbUrl(e.target.value)}
//                   className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//                   placeholder="postgresql://username:password@localhost:5432/vector_db"
//                 />
//                 <p className="text-gray-500 text-xs mt-1">
//                   This database will store the schema embeddings
//                 </p>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-green-400 mb-1">
//                   Target Database URL
//                 </label>
//                 <input
//                   type="text"
//                   value={targetDbUrl}
//                   onChange={(e) => setTargetDbUrl(e.target.value)}
//                   className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
//                   placeholder="postgresql://username:password@localhost:5432/target_db"
//                 />
//                 <p className="text-gray-500 text-xs mt-1">
//                   This is the database you want to query
//                 </p>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50"
//                 >
//                   {loading ? "Saving..." : "Save Connection"}
//                 </button>
//               </div>
//             </form>
//           </>
//         ) : (
//           <>
//             <p className="text-green-400 mb-4">
//               Analyzing database schema and creating embeddings for natural
//               language queries:
//             </p>

//             {error && (
//               <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
//                 {error}
//               </div>
//             )}

//             {renderStatusContent()}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// src/components/DatabaseConnectionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface SchemaStatusResponse {
  connection_id: string;
  name: string;
  status: string;
  error?: string;
}

interface DatabaseConnection {
  id: string;
  name: string;
  vector_db_url: string;
  target_db_url: string;
  schema_status?: string;
}

interface DatabaseConnectionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  pendingConnection?: DatabaseConnection | null;
}

export default function DatabaseConnectionModal({
  onClose,
  onSuccess,
  pendingConnection,
}: DatabaseConnectionModalProps) {
  const [name, setName] = useState("");
  const [vectorDbUrl, setVectorDbUrl] = useState("");
  const [targetDbUrl, setTargetDbUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [statusDetails, setStatusDetails] =
    useState<SchemaStatusResponse | null>(null);
  const { getToken } = useAuth();

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Start polling if there's a pending connection
  useEffect(() => {
    if (pendingConnection) {
      setIsPolling(true);
    }
  }, [pendingConnection]);

  // Set up polling
  useEffect(() => {
    if (!isPolling || !pendingConnection) return;

    // Check once immediately
    checkExtractionStatus(pendingConnection.id);

    // Then set up polling every 2 seconds
    const interval = setInterval(() => {
      checkExtractionStatus(pendingConnection.id);
    }, 2000);

    // Clean up
    return () => clearInterval(interval);
  }, [isPolling, pendingConnection]);

  const checkExtractionStatus = async (connectionId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${backendUrl}/api/connections/${connectionId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check extraction status");
      }

      const data = await response.json();
      setStatusDetails(data);

      // If completed or failed, stop polling
      if (data.status === "completed" || data.status === "failed") {
        setIsPolling(false);

        // If completed, refresh the connection list
        if (data.status === "completed") {
          onSuccess();
        }
      }
    } catch (err) {
      console.error("Error checking extraction status:", err);
      setError(err instanceof Error ? err.message : "Failed to check status");
      setIsPolling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !vectorDbUrl || !targetDbUrl) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get the token for authentication with your backend
      const token = await getToken();

      // Make the request to your FastAPI backend
      const response = await fetch(`${backendUrl}/api/connections/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          vector_db_url: vectorDbUrl,
          target_db_url: targetDbUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create connection");
      }

      // Get the created connection data

      // Start polling for status
      setIsPolling(true);
      setLoading(false);

      // Call onSuccess to refresh the connections list
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!pendingConnection) return;

    setError("");
    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(
        `${backendUrl}/api/connections/${pendingConnection.id}/extract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to retry extraction");
      }

      // Start polling again
      setIsPolling(true);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to retry extraction"
      );
      setLoading(false);
    }
  };

  // Render extraction status
  const renderExtractionStatus = () => {
    const status =
      statusDetails?.status || pendingConnection?.schema_status || "pending";

    switch (status) {
      case "pending":
      case "processing":
        return (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <h3 className="text-green-400 font-mono text-lg">
                Extracting schema and generating embeddings...
              </h3>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              This might take a few minutes
            </p>
          </div>
        );

      case "completed":
        return (
          <div className="mb-6 bg-green-900/30 border border-green-700 p-4 rounded">
            <h3 className="text-green-400 font-mono mb-2">
              Schema extraction completed!
            </h3>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="mt-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
            >
              Continue to Terminal
            </button>
          </div>
        );

      case "failed":
        return (
          <div className="mb-6 bg-red-900/30 border border-red-700 p-4 rounded">
            <h3 className="text-red-400 font-mono mb-2">
              Schema extraction failed
            </h3>
            {statusDetails?.error && (
              <p className="text-red-300 text-sm mb-2">{statusDetails.error}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Retrying..." : "Retry Extraction"}
              </button>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl text-green-500 font-mono mb-4">
          {pendingConnection
            ? "Schema Extraction"
            : "Database Connection Required"}
        </h2>

        {pendingConnection ? (
          <>
            <p className="text-green-400 mb-4">
              {pendingConnection.name}: Analyzing database schema and creating
              embeddings for natural language queries
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {renderExtractionStatus()}
          </>
        ) : (
          <>
            <p className="text-green-400 mb-4">
              To use THEO, you need to provide database connections:
            </p>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-green-400 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
                  placeholder="My Database"
                />
              </div>

              <div className="mb-4">
                <label className="block text-green-400 mb-1">
                  Vector Database URL
                </label>
                <input
                  type="text"
                  value={vectorDbUrl}
                  onChange={(e) => setVectorDbUrl(e.target.value)}
                  className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
                  placeholder="postgresql://username:password@localhost:5432/vector_db"
                />
                <p className="text-gray-500 text-xs mt-1">
                  This database will store the schema embeddings
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-green-400 mb-1">
                  Target Database URL
                </label>
                <input
                  type="text"
                  value={targetDbUrl}
                  onChange={(e) => setTargetDbUrl(e.target.value)}
                  className="w-full bg-black border border-green-500 text-green-400 px-3 py-2 rounded font-mono"
                  placeholder="postgresql://username:password@localhost:5432/target_db"
                />
                <p className="text-gray-500 text-xs mt-1">
                  This is the database you want to query
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Connection"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
