import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
     
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w
        -96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(90,60,40,0.06) 0%, transparent 70%)" }} />

      
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#342a22" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-sm px-6 animate-fade-in">
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #342a22 0%, #5d4c3e 100%)" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4h16a2 2 0 012 2v20l-4-3-4 3-4-3-4 3V6a2 2 0 012-2z" fill="#f5a623" fillOpacity="0.9"/>
                <path d="M12 11h8M12 15h6" stroke="#faf8f4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400" />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-ink-950 mb-2 leading-tight">
            B-Lib
          </h1>
          <p className="text-ink-500 text-sm leading-relaxed">
            Your personal library. Save what matters, find it later, anytime.
          </p>
        </div>

        {/* Login card */}
        <div className="card p-6">
          <div className="text-center mb-5">
            <p className="text-xs text-ink-500 uppercase tracking-widest font-medium">
              Sign in to continue
            </p>
          </div>

          <LoginButton />

          <p className="text-center text-xs text-ink-400 mt-4">
            Your bookmarks are private and encrypted.
            <br />Only you can see them.
          </p>
        </div>

        
        
      </div>
    </main>
  );
}
