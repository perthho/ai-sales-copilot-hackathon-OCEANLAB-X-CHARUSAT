"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Phone,
  Plus,
  ArrowLeft,
  UserPlus,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { DEMO_CONTACTS } from "@/types";

/* ---------- Contacts data (from shared types) ---------- */
const existingContacts = DEMO_CONTACTS.map((c) => ({
  id: c.id,
  name: c.name,
  company: c.company,
  phone: c.phone,
  email: "",
}));

type Contact = { id: string; name: string; company: string; phone: string; email: string };

/* ---------- Context ---------- */
type StartCallContextType = { open: () => void };
const StartCallContext = createContext<StartCallContextType>({ open: () => {} });
export const useStartCall = () => useContext(StartCallContext);

export function StartCallProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <StartCallContext.Provider value={{ open }}>
      {children}
      <StartCallDialog isOpen={isOpen} onClose={close} />
    </StartCallContext.Provider>
  );
}

/* ---------- Dialog ---------- */
function StartCallDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "new" | "confirm">("pick");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "" });
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("pick");
      setSearch("");
      setSelected(null);
      setForm({ name: "", company: "", phone: "", email: "" });
      setIsStarting(false);
    }
  }, [isOpen]);

  // Close on backdrop click
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const filtered = existingContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  function selectContact(contact: Contact) {
    setSelected(contact);
    setStep("confirm");
  }

  function saveNewContact() {
    if (!form.name.trim() || !form.phone.trim()) return;
    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };
    setSelected(newContact);
    setStep("confirm");
  }

  const [isStarting, setIsStarting] = useState(false);

  async function startCall() {
    if (!selected || isStarting) return;
    setIsStarting(true);

    try {
      const res = await fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selected.id,
          contactName: selected.name,
          contactCompany: selected.company,
          contactPhone: selected.phone,
        }),
      });

      if (!res.ok) throw new Error("Failed to start call");

      const { callId } = await res.json();
      onClose();
      router.push(`/call?id=${callId}`);
    } catch (err) {
      console.error("Start call error:", err);
      setIsStarting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        className="fixed inset-0 bg-black/30 z-[80] flex items-center justify-center p-4"
      >
        {/* Modal */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[85vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {step !== "pick" && (
                <button
                  onClick={() => setStep(step === "confirm" && !form.name ? "pick" : step === "confirm" ? "new" : "pick")}
                  className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <h2 className="text-[15px] font-heading font-semibold text-foreground">
                {step === "pick" && "Start a Call"}
                {step === "new" && "New Contact"}
                {step === "confirm" && "Ready to Call"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Step: Pick Contact */}
          {step === "pick" && (
            <div className="flex flex-col overflow-hidden">
              {/* Search */}
              <div className="px-4 py-3 border-b border-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                    placeholder="Search contacts..."
                    autoFocus
                  />
                </div>
              </div>

              {/* Add new */}
              <button
                onClick={() => setStep("new")}
                className="flex items-center gap-3 px-5 py-3 text-[13px] font-medium text-primary hover:bg-muted transition-colors border-b border-border"
              >
                <UserPlus className="size-4" />
                Add New Contact
              </button>

              {/* Contact list */}
              <div className="flex-1 overflow-y-auto py-1 custom-scrollbar max-h-[340px]">
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No contacts found</p>
                )}
                {filtered.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="size-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.company}</p>
                    </div>
                    <Phone className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: New Contact Form */}
          {step === "new" && (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Rahul Mehta"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. FinServe Pvt Ltd"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  placeholder="rahul@company.com"
                />
              </div>
              <button
                onClick={saveNewContact}
                disabled={!form.name.trim() || !form.phone.trim()}
                className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Save &amp; Continue
              </button>
            </div>
          )}

          {/* Step: Confirm & Start */}
          {step === "confirm" && selected && (
            <div className="p-5 space-y-5">
              {/* Selected contact card */}
              <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
                <div className="size-12 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">{selected.name}</p>
                  {selected.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building className="size-3" />
                      {selected.company}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.phone}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                The AI copilot will listen in and provide real-time suggestions during the call.
              </p>

              <button
                onClick={startCall}
                disabled={isStarting}
                className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-[15px] font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Phone className="size-4" />
                {isStarting ? "Starting..." : "Start Call"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
