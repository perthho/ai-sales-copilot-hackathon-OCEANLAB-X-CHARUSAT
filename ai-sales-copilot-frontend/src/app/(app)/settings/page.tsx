import {
  User,
  Link2,
  Bell,
  Brain,
  Shield,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Upload,
  FileText,
  Trash2,
  File,
} from "lucide-react";

/* ---------- Section Card ---------- */
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ---------- Toggle Row ---------- */
function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        className={`relative w-10 h-6 rounded-full transition-colors ${
          defaultOn ? "bg-primary" : "bg-muted"
        }`}
      >
        <div
          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${
            defaultOn ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/* ---------- Page ---------- */
export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-[720px] space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <SettingsSection icon={User} title="Profile" description="Your personal information">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-14 rounded-full bg-accent flex items-center justify-center text-lg font-semibold text-primary">
            AS
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">Aman Sharma</p>
            <p className="text-[13px] text-muted-foreground">aman.sharma@company.com</p>
            <p className="text-xs text-muted-foreground">Enterprise Lead</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Full Name</label>
            <input
              type="text"
              defaultValue="Aman Sharma"
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              defaultValue="aman.sharma@company.com"
              className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <button className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </SettingsSection>

      {/* CRM Integration */}
      <SettingsSection icon={Link2} title="CRM Integration" description="Connect your CRM for automatic sync">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-foreground">Z</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Zoho CRM</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="size-3 text-success" />
                <span className="text-xs text-success font-medium">Connected</span>
              </div>
            </div>
          </div>
          <button className="text-xs text-primary font-medium hover:underline">Disconnect</button>
        </div>
        <div className="space-y-2">
          {[
            { label: "Auto-sync call notes", connected: true },
            { label: "Update deal stages", connected: true },
            { label: "Create follow-up tasks", connected: true },
            { label: "Sync contact data", connected: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`size-3.5 ${item.connected ? "text-success" : "text-muted-foreground"}`} />
                <span className="text-[13px] text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Knowledge Base */}
      <SettingsSection icon={BookOpen} title="Knowledge Base" description="Upload company docs, pricing sheets, playbooks, and rules — the AI uses these during calls">
        {/* Upload area */}
        <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors mb-5">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-medium text-foreground">Click to upload or drag &amp; drop</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, CSV up to 25 MB each</p>
          </div>
          <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt,.csv,.xlsx" />
        </label>

        {/* Uploaded files */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Uploaded files</p>
          {[
            { name: "Standard_Pricing_v4.pdf", size: "2.4 MB", date: "Apr 1, 2026", type: "Pricing" },
            { name: "Rapid_Onboarding_Protocol.pdf", size: "1.1 MB", date: "Mar 28, 2026", type: "Playbook" },
            { name: "Objection_Handling_Guide.docx", size: "840 KB", date: "Mar 25, 2026", type: "Rules" },
            { name: "Product_Feature_Matrix.xlsx", size: "320 KB", date: "Mar 20, 2026", type: "Product" },
            { name: "Company_Policy_Compliance.pdf", size: "1.8 MB", date: "Mar 15, 2026", type: "Compliance" },
          ].map((file) => (
            <div key={file.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size} &middot; {file.date}</p>
              </div>
              <span className="inline-flex items-center h-5 px-2 rounded-md bg-muted text-[11px] font-medium text-muted-foreground shrink-0">
                {file.type}
              </span>
              <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notifications" description="Choose what you want to be notified about">
        <div className="divide-y divide-border">
          <ToggleRow label="Call reminders" description="Get notified 5 minutes before scheduled calls" defaultOn={true} />
          <ToggleRow label="AI suggestions summary" description="Daily digest of your AI suggestion usage" defaultOn={true} />
          <ToggleRow label="Deal stage changes" description="Notify when deals move to a new stage" defaultOn={false} />
          <ToggleRow label="Team performance alerts" description="Weekly summary of team metrics" defaultOn={true} />
        </div>
      </SettingsSection>

      {/* AI Preferences */}
      <SettingsSection icon={Brain} title="AI Preferences" description="Customize how the AI copilot works for you">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Suggestion style</label>
            <select className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none appearance-none">
              <option>Balanced — Mix of tactical and conversational</option>
              <option>Aggressive — Focus on closing and commitment</option>
              <option>Consultative — Focus on discovery and rapport</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Language preference</label>
            <select className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-[13px] text-foreground focus:ring-1 focus:ring-primary/40 focus:outline-none appearance-none">
              <option>Hinglish (Hindi + English mix)</option>
              <option>English only</option>
              <option>Hindi only</option>
            </select>
          </div>
          <ToggleRow label="Auto-use top suggestion" description="Automatically flag the highest confidence suggestion" defaultOn={false} />
          <ToggleRow label="Show RAG sources" description="Display knowledge base sources alongside suggestions" defaultOn={true} />
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection icon={Shield} title="Security" description="Manage your account security">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <span className="text-[13px] font-medium text-foreground">Change password</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <span className="text-[13px] font-medium text-foreground">Two-factor authentication</span>
            <span className="text-xs text-muted-foreground">Not enabled</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <span className="text-[13px] font-medium text-foreground">Active sessions</span>
            <span className="text-xs text-muted-foreground">2 devices</span>
          </button>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/20 rounded-xl p-5">
        <h2 className="text-[15px] font-semibold text-foreground mb-1">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-4">Irreversible actions</p>
        <div className="flex gap-3">
          <button className="h-8 px-4 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors">
            Export all data
          </button>
          <button className="h-8 px-4 border border-destructive/30 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
