// Terminal.tsx
"use client";

import React, { useState, useEffect } from "react";
import TerminalHeader from "./TerminalHeader";
import TerminalBody from "./TerminalBody";
import TerminalInput from "./TerminalInput";
import { useAuth } from "@clerk/nextjs";

// Backend conversation format
interface ConversationResponse {
  id: string;
  connection_id: string;
  timestamp: string;
  user_query: string;
  generated_sql: string | null;
  query_result: Array<Record<string, unknown>> | Record<string, unknown> | null;
  error: string | null;
}

// Query result format from API
interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

// API Response format
interface QueryResponse {
  query_text: string;
  generated_sql: string | null;
  result: QueryResult | null;
  error: string | null;
}

// Format expected by the Terminal components
interface MessageData {
  id: number;
  text: string;
  type: "user" | "system";
  timestamp: string;
  sql?: string;
  result?: {
    columns: string[];
    rows: Record<string, unknown>[];
  };
}

// Connection interface
interface Connection {
  id: string;
  name: string;
  vector_db_url: string;
  target_db_url: string;
}

const Terminal: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userConnection, setUserConnection] = useState<Connection | null>(null);
  const { getToken } = useAuth();
  // Track the next message ID to use
  const [nextMessageId, setNextMessageId] = useState(1);
  const [showClearChatDialog, setShowClearChatDialog] =
    useState<boolean>(false);

  // Fetch user's connection and conversations when component mounts
  useEffect(() => {
    const initialize = async () => {
      await fetchUserConnection();
    };

    initialize();
  }, []);

  // After connection is fetched, get the conversations
  useEffect(() => {
    if (userConnection) {
      fetchConversations();
    }
  }, [userConnection]);

  const fetchUserConnection = async () => {
    try {
      const token = await getToken();
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${backendUrl}/api/connections/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.statusText}`);
      }

      const connections = await response.json();

      // Assuming the user only has one connection
      if (connections && connections.length > 0) {
        setUserConnection(connections[0]);
      } else {
        // Add a terminal message if no connections exist
        addSystemMessage(
          "No database connections found. Please set up a connection first."
        );
      }
    } catch (error) {
      console.error("Error fetching user connection:", error);
      addSystemMessage(
        `Error loading connection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const fetchConversations = async () => {
    if (!userConnection) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${backendUrl}/api/conversations/`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`
        );
      }

      const conversations = await response.json();

      if (conversations && conversations.length > 0) {
        // Convert backend conversations to frontend message format
        const convertedMessages = convertToMessages(conversations);
        setMessages(convertedMessages);

        // Update the next message ID based on the highest ID in the converted messages
        const highestId = Math.max(...convertedMessages.map((m) => m.id));
        setNextMessageId(highestId + 1);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Only show error if we don't already have a "no connection" message
      if (
        messages.length === 0 ||
        messages[0].text.indexOf("No database connections") === -1
      ) {
        addSystemMessage(
          `Error loading conversations: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to add a system message
  const addSystemMessage = (text: string) => {
    const newMessage: MessageData = {
      id: nextMessageId,
      text,
      type: "system",
      timestamp: new Date().toLocaleString(),
    };

    setMessages([newMessage]);
    setNextMessageId(nextMessageId + 1);
  };

  // Convert backend conversations to frontend message format
  const convertToMessages = (
    conversations: ConversationResponse[]
  ): MessageData[] => {
    // Sort by timestamp (oldest first) for proper conversation flow
    const sortedConversations = [...conversations].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const messages: MessageData[] = [];
    let messageId = 1;

    sortedConversations.forEach((conv) => {
      // Add user message
      messages.push({
        id: messageId++,
        text: conv.user_query,
        type: "user",
        timestamp: new Date(conv.timestamp).toLocaleString(),
      });

      // Add system message
      const systemText = conv.error
        ? `Error: ${conv.error}`
        : "Query executed successfully";

      const systemMessage: MessageData = {
        id: messageId++,
        text: systemText,
        type: "system",
        timestamp: new Date(conv.timestamp).toLocaleString(),
      };

      // Add SQL if available
      if (conv.generated_sql) {
        systemMessage.sql = conv.generated_sql;
      }

      // Add result if available and not an error
      if (conv.query_result && !conv.error) {
        try {
          let resultRows;
          let resultColumns;

          // Handle string JSON that needs parsing
          if (typeof conv.query_result === "string") {
            try {
              resultRows = JSON.parse(conv.query_result);
              if (resultRows && resultRows.length > 0) {
                resultColumns = Object.keys(resultRows[0]);
              } else {
                resultColumns = ["result"];
              }
            } catch (e) {
              console.error(e);
              resultRows = [{ result: conv.query_result }];
              resultColumns = ["result"];
            }
          }
          // Handle array results
          else if (
            Array.isArray(conv.query_result) &&
            conv.query_result.length > 0
          ) {
            resultRows = conv.query_result;
            resultColumns = Object.keys(conv.query_result[0]);
          }
          // Handle object results
          else if (typeof conv.query_result === "object") {
            resultRows = [conv.query_result];
            resultColumns = Object.keys(
              conv.query_result as Record<string, unknown>
            );
          }
          // Handle primitives
          else {
            resultRows = [{ result: String(conv.query_result) }];
            resultColumns = ["result"];
          }

          systemMessage.result = {
            columns: resultColumns,
            rows: resultRows,
          };
        } catch (e) {
          console.error("Error processing query result:", e);
        }
      }

      messages.push(systemMessage);
    });

    return messages;
  };

  const handleSendMessage = async (message: string) => {
    // Check if connection exists
    if (!userConnection) {
      addSystemMessage(
        "No database connection found. Please set up a connection first."
      );
      return;
    }

    // Add user message immediately for better UX
    const userMessageId = nextMessageId;
    const newUserMessage: MessageData = {
      id: userMessageId,
      text: message,
      type: "user",
      timestamp: new Date().toLocaleString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setNextMessageId(userMessageId + 1);

    // Add temporary processing message
    const processingMessageId = userMessageId + 1;
    const processingMessage: MessageData = {
      id: processingMessageId,
      text: "Processing your query...",
      type: "system",
      timestamp: new Date().toLocaleString(),
    };

    setMessages((prev) => [...prev, processingMessage]);
    setNextMessageId(processingMessageId + 1);

    try {
      // Get auth token
      const token = await getToken();

      // Call your query API
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/queries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connection_id: userConnection.id,
          query_text: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Query execution failed: ${response.statusText}`);
      }

      const result: QueryResponse = await response.json();

      // Create a system message with the query results
      const resultMessage: MessageData = {
        id: processingMessageId,
        text: result.error
          ? `Error: ${result.error}`
          : "Query executed successfully",
        type: "system",
        timestamp: new Date().toLocaleString(),
      };

      // Add SQL if available
      if (result.generated_sql) {
        resultMessage.sql = result.generated_sql;
      }

      // Add result if available
      if (result.result && !result.error) {
        resultMessage.result = {
          columns: result.result.columns,
          rows: result.result.rows,
        };
      }

      // Replace the processing message with the result
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === processingMessageId ? resultMessage : msg
        )
      );

      // No need to refresh conversations - we've already added the messages locally
    } catch (error) {
      console.error("Error sending message:", error);

      // Replace processing message with error message
      const errorMessage: MessageData = {
        id: processingMessageId,
        text: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "system",
        timestamp: new Date().toLocaleString(),
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === processingMessageId ? errorMessage : msg))
      );
    }
  };

  useEffect(() => {
    if (messages.length / 2 > 25) {
      setShowClearChatDialog(true);
    }
  }, [messages]);

  const clearConversations = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Call the API to clear conversations
      const response = await fetch(`${backendUrl}/api/conversations/clear/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to clear conversations: ${response.statusText}`
        );
      }

      // Clear the messages in the UI
      setMessages([]);
      setNextMessageId(1);
      setShowClearChatDialog(false);

      // Add a confirmation message
      addSystemMessage("All conversations have been cleared.");
    } catch (error) {
      console.error("Error clearing conversations:", error);
      addSystemMessage(
        `Error clearing conversations: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="terminal">
      <TerminalHeader />
      <TerminalBody messages={messages} isLoading={isLoading} />
      {showClearChatDialog ? (
        <div className="p-4 bg-black border-t border-green-500">
          <div className="flex flex-col items-center justify-center text-green-500 text-center">
            <p className="mb-2">
              You have reached the limit conversation context
            </p>
            <p className="mb-4">
              Please clear your conversation history to continue.
            </p>
            <button
              onClick={clearConversations}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? "Clearing..." : "Clear Conversations"}
            </button>
          </div>
        </div>
      ) : (
        <TerminalInput onSendMessage={handleSendMessage} />
      )}
      <div className="crt-effect"></div>
    </div>
  );
};

export default Terminal;
