import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "./AuthContext";
import {
  api,
  ApiRequestError,
  type Appointment,
  type AppointmentStatus,
  type DashboardSummary,
  type Inquiry,
  type InquiryStatus,
  type PaginationMeta,
} from "./api";

export default function App() {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (status === "anonymous") {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
}

function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Clinic Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage appointments and inquiries.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

type View = "dashboard" | "appointments" | "inquiries";

function AuthenticatedApp() {
  const { admin, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");

  const navItems: { key: View; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "appointments", label: "Appointments" },
    { key: "inquiries", label: "Inquiries" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-slate-900">Clinic Admin</span>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  view === item.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>
            {admin?.name} <span className="text-slate-400">· {admin?.role}</span>
          </span>
          <button onClick={() => logout()} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {view === "dashboard" && <DashboardView />}
        {view === "appointments" && <AppointmentsView />}
        {view === "inquiries" && <InquiriesView />}
      </main>
    </div>
  );
}

function DashboardView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load summary."));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!summary) return <p className="text-sm text-slate-500">Loading…</p>;

  const cards = [
    { label: "Pending appointments", value: summary.appointments.pending, tone: "amber" },
    { label: "Confirmed appointments", value: summary.appointments.confirmed, tone: "emerald" },
    { label: "New inquiries", value: summary.inquiries.new, tone: "sky" },
    { label: "Active services", value: summary.services.active, tone: "slate" },
  ] as const;

  const toneClasses: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">Overview</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ring-1 ${toneClasses[card.tone]}`}>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <SummaryTable
          title="Appointments"
          rows={[
            ["Pending", summary.appointments.pending],
            ["Confirmed", summary.appointments.confirmed],
            ["Completed", summary.appointments.completed],
            ["Cancelled", summary.appointments.cancelled],
            ["No-show", summary.appointments.noShow],
          ]}
        />
        <SummaryTable
          title="Inquiries"
          rows={[
            ["New", summary.inquiries.new],
            ["Read", summary.inquiries.read],
            ["Resolved", summary.inquiries.resolved],
          ]}
        />
      </div>
    </div>
  );
}

function SummaryTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <dl className="mt-3 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-1.5 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const appointmentStatusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

const appointmentStatusOptions: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

function AppointmentsView() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api
      .getAppointments({ page, limit: 20, status: statusFilter })
      .then(({ data, meta }) => {
        setRows(data);
        setMeta(meta ?? null);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load appointments."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter]);

  async function changeStatus(id: string, next: AppointmentStatus) {
    setSavingId(id);
    try {
      const updated = await api.updateAppointment(id, { status: next });
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to update appointment.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Appointment requests</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as AppointmentStatus | "");
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {appointmentStatusOptions.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Patient</th>
              <th className="px-4 py-2.5">Service</th>
              <th className="px-4 py-2.5">Preferred</th>
              <th className="px-4 py-2.5">Requested</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No appointment requests here.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{row.patientName}</div>
                  <div className="text-slate-500">{row.patientPhone}</div>
                </td>
                <td className="px-4 py-3">{row.requestedService}</td>
                <td className="px-4 py-3 text-slate-500">
                  {row.preferredDate ?? "—"} {row.preferredTime ?? ""}
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${appointmentStatusStyles[row.status]}`}>
                      {row.status.replace("_", " ")}
                    </span>
                    <select
                      disabled={savingId === row.id}
                      value={row.status}
                      onChange={(e) => changeStatus(row.id, e.target.value as AppointmentStatus)}
                      className="rounded-md border border-slate-300 px-1.5 py-1 text-xs disabled:opacity-50"
                    >
                      {appointmentStatusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager meta={meta} page={page} onChange={setPage} />
    </div>
  );
}

const inquiryStatusStyles: Record<InquiryStatus, string> = {
  NEW: "bg-sky-100 text-sky-800",
  READ: "bg-slate-200 text-slate-700",
  RESOLVED: "bg-emerald-100 text-emerald-800",
};

const inquiryStatusOptions: InquiryStatus[] = ["NEW", "READ", "RESOLVED"];

function InquiriesView() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api
      .getInquiries({ page, limit: 20, status: statusFilter })
      .then(({ data, meta }) => {
        setRows(data);
        setMeta(meta ?? null);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load inquiries."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter]);

  async function changeStatus(id: string, next: InquiryStatus) {
    setSavingId(id);
    try {
      const updated = await api.updateInquiry(id, { status: next });
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to update inquiry.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Contact inquiries</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as InquiryStatus | "");
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {inquiryStatusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {!loading && rows.length === 0 && <p className="text-sm text-slate-400">No inquiries here.</p>}
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-sm text-slate-500">
                  {row.phone}
                  {row.email ? ` · ${row.email}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inquiryStatusStyles[row.status]}`}>{row.status}</span>
                <select
                  disabled={savingId === row.id}
                  value={row.status}
                  onChange={(e) => changeStatus(row.id, e.target.value as InquiryStatus)}
                  className="rounded-md border border-slate-300 px-1.5 py-1 text-xs disabled:opacity-50"
                >
                  {inquiryStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{row.message}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(row.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Pager meta={meta} page={page} onChange={setPage} />
    </div>
  );
}

function Pager({ meta, page, onChange }: { meta: PaginationMeta | null; page: number; onChange: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= meta.totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
