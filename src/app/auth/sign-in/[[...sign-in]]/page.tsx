import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header/Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-slate-100 text-3xl font-bold mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300">Continue your journey with Theo</p>
        </div>

        {/* Clerk's SignIn component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-slate-800 border-slate-700",
              headerTitle: "text-slate-100",
              headerSubtitle: "text-slate-300",
              socialButtonsBlockButton:
                "bg-slate-700 border-slate-600 text-slate-100",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
              footerAction: "text-slate-300",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
            },
          }}
        />
      </div>
    </div>
  );
}
