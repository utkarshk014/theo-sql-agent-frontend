"use client";
// src/app/page.tsx
import Link from "next/link";
import { Database, Code, Sparkles, MessageSquare } from "lucide-react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/terminal");
    }
  }, [user, isLoaded, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black font-mono overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <header className="py-6 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-green-500 text-xl font-bold">THEO</span>
            <span className="text-gray-300 ml-2 text-sm">v1.0.0</span>
          </div>
          <div className="space-x-4 flex gap-2 items-center">
            {user && <div className="text-gray-300">{user?.firstName}</div>}
            {user ? (
              <SignOutButton>
                <div className="text-gray-300 hover:text-green-500 transition cursor-pointer">
                  Sign Out
                </div>
              </SignOutButton>
            ) : (
              <SignInButton>
                <div className="text-gray-300 hover:text-green-500 transition cursor-pointer">
                  Sign In
                </div>
              </SignInButton>
            )}
            {!user && (
              <SignInButton>
                <div className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-md transition cursor-pointer">
                  Sign Up
                </div>
              </SignInButton>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="mt-16 md:mt-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Meet <span className="text-green-500">THEO</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            Your AI SQL agent that translates natural language into powerful
            database queries.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="mt-4">
              <SignInButton>
                <div className="inline-flex items-center bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-md transition cursor-pointer">
                  <Sparkles className="mr-2 h-5 w-5" /> Start Using THEO
                </div>
              </SignInButton>
            </div>
          </div>
        </div>

        {/* iframe video */}

        <div className="max-w-6xl mt-10 mx-auto mb-20">
          <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
            <iframe
              className="w-full h-full object-cover"
              src="https://www.youtube.com/embed/sxI1yOXRh-M?si=zmH9bNsQFf_12kRe&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1&autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
            <div className="text-green-500 mb-4">
              <Database className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Connect Any Database
            </h3>
            <p className="text-gray-400">
              Connect THEO to your PostgreSQL database and start querying in
              natural language immediately.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
            <div className="text-green-500 mb-4">
              <Code className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Perfect SQL</h3>
            <p className="text-gray-400">
              THEO writes optimized SQL queries with proper JOINs, indexes, and
              performance considerations.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
            <div className="text-green-500 mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Conversation Memory
            </h3>
            <p className="text-gray-400">
              Ask follow-up questions and refine your queries - THEO remembers
              context from previous interactions.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 rounded-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to transform how you interact with data?
            </h2>
            <p className="mt-4 text-gray-300">
              Start talking to your database in plain English today.
            </p>
            <div className="mt-6">
              <SignInButton>
                <div className="inline-flex items-center bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-md transition cursor-pointer">
                  <Sparkles className="mr-2 h-5 w-5" /> Start Using THEO
                </div>
              </SignInButton>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 mt-24 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} THEO SQL Agent. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <Link href="#" className="text-gray-400 hover:text-green-500">
              Terms
            </Link>
            <Link href="#" className="text-gray-400 hover:text-green-500">
              Privacy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-green-500">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
