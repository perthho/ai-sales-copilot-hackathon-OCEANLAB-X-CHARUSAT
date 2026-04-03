import {
  Search,
  Plus,
  Phone,
  Mail,
  MoreHorizontal,
  Building,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

const contacts = [
  {
    id: "1",
    name: "Rahul Mehta",
    role: "VP Engineering",
    company: "FinServe Pvt Ltd",
    initials: "RM",
    email: "rahul@finserve.in",
    phone: "+91 98765 43210",
    deal: "₹15,00,000",
    stage: "Negotiation",
    lastContact: "2 hours ago",
  },
  {
    id: "2",
    name: "Priya Nair",
    role: "Head of Operations",
    company: "Indus Retail",
    initials: "PN",
    email: "priya@indusretail.com",
    phone: "+91 87654 32109",
    deal: "₹8,50,000",
    stage: "Discovery",
    lastContact: "Yesterday",
  },
  {
    id: "3",
    name: "Arjun Singh",
    role: "CTO",
    company: "Lumina Ltd",
    initials: "AS",
    email: "arjun@lumina.io",
    phone: "+91 76543 21098",
    deal: "₹21,00,000",
    stage: "Closing",
    lastContact: "3 days ago",
  },
  {
    id: "4",
    name: "Kavitha Rao",
    role: "Procurement Lead",
    company: "TechBridge Solutions",
    initials: "KR",
    email: "kavitha@techbridge.in",
    phone: "+91 65432 10987",
    deal: "₹5,20,000",
    stage: "Proposal",
    lastContact: "1 week ago",
  },
  {
    id: "5",
    name: "Vikram Desai",
    role: "Director of IT",
    company: "Nova Fintech",
    initials: "VD",
    email: "vikram@novafintech.com",
    phone: "+91 54321 09876",
    deal: "₹12,00,000",
    stage: "Discovery",
    lastContact: "4 days ago",
  },
];

function ContactRow({ contact }: { contact: (typeof contacts)[0] }) {
  return (
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="py-3.5 pl-5">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
            {contact.initials}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.role}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <Building className="size-3.5 text-muted-foreground" />
          <span className="text-[13px] text-foreground">{contact.company}</span>
        </div>
      </td>
      <td className="py-3.5 text-[13px] font-medium text-foreground">{contact.deal}</td>
      <td className="py-3.5">
        <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-muted text-xs font-medium text-muted-foreground">
          {contact.stage}
        </span>
      </td>
      <td className="py-3.5 text-xs text-muted-foreground">{contact.lastContact}</td>
      <td className="py-3.5 pr-5">
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Phone className="size-3.5" />
          </button>
          <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Mail className="size-3.5" />
          </button>
          <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileContactCard({ contact }: { contact: (typeof contacts)[0] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="size-10 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary shrink-0">
        {contact.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{contact.name}</p>
        <p className="text-xs text-muted-foreground">{contact.company} &middot; {contact.stage}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-medium text-foreground">{contact.deal}</p>
        <p className="text-[11px] text-muted-foreground">{contact.lastContact}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </div>
  );
}

export default function ContactsPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Contacts</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {contacts.length} contacts across {new Set(contacts.map((c) => c.company)).size} companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
              placeholder="Search contacts..."
              type="text"
            />
          </div>
          <button className="size-9 flex items-center justify-center border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Filter className="size-4" />
          </button>
          <button className="h-9 px-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="size-4" />
            <span className="hidden md:inline">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 pl-5 text-xs font-medium text-muted-foreground">Name</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Company</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Deal Value</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Stage</th>
              <th className="py-3 text-xs font-medium text-muted-foreground">Last Contact</th>
              <th className="py-3 pr-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {contacts.map((c) => (
          <MobileContactCard key={c.id} contact={c} />
        ))}
      </div>
    </div>
  );
}
