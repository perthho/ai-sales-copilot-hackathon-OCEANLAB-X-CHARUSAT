import {
  Brain,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-[460px] px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="size-5 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground tracking-tight">
            Sales Copilot
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Sign in to access your deals, calls, and AI-powered insights.
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
          {/* Zoho CTA */}
          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-3 w-full h-12 bg-primary text-primary-foreground font-semibold text-[15px] rounded-xl hover:bg-primary/90 transition-colors"
          >
            <div className="size-5 bg-primary-foreground/20 rounded flex items-center justify-center">
              <Zap className="size-3" />
            </div>
            Sign in with Zoho
            <ArrowRight className="size-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Alt methods */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-10 border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors">
              <Mail className="size-4 text-muted-foreground" />
              Email
            </button>
            <button className="flex items-center justify-center gap-2 h-10 border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors">
              <KeyRound className="size-4 text-muted-foreground" />
              SSO
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-1">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-10 w-full grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: "Secure auth", color: "text-primary" },
            { icon: Sparkles, label: "AI insights", color: "text-secondary" },
            { icon: Lock, label: "Encrypted", color: "text-success" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="size-9 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm">
                <item.icon className={`size-4 ${item.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground text-center">
          Powered by Groq, Llama 3.3 &amp; Sarvam AI
        </p>
      </main>
    </div>
  );
}
