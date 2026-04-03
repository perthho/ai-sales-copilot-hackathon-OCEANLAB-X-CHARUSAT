export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  role: string;
}

export interface TranscriptEntry {
  speaker: "customer" | "agent";
  text: string;
  timestamp: number;
}

export interface Call {
  id: string;
  agentId: string;
  contactId: string;
  contactName: string;
  contactCompany: string;
  contactPhone: string;
  status: "active" | "ended";
  startedAt: number;
  endedAt: number | null;
  transcript: TranscriptEntry[];
  teleprompterHistory: string[];
  summary: string | null;
}

export const DEMO_AGENT_ID = "demo-agent";

export const DEMO_CONTACTS: Contact[] = [
  {
    id: "contact-1",
    name: "Rahul Mehta",
    company: "FinServe Pvt Ltd",
    phone: "+919876543210",
    role: "VP of Engineering",
  },
  {
    id: "contact-2",
    name: "Priya Nair",
    company: "Indus Retail",
    phone: "+918765432109",
    role: "Head of Operations",
  },
  {
    id: "contact-3",
    name: "Arjun Singh",
    company: "Lumina Ltd",
    phone: "+917654321098",
    role: "CTO",
  },
  {
    id: "contact-4",
    name: "Kavitha Rao",
    company: "TechBridge Solutions",
    phone: "+916543210987",
    role: "Procurement Lead",
  },
  {
    id: "contact-5",
    name: "Vikram Desai",
    company: "Nova Fintech",
    phone: "+915432109876",
    role: "Director of IT",
  },
];
