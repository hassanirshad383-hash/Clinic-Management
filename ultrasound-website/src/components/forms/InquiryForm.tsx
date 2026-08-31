import { useState, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { api, ApiRequestError } from "../../lib/api";
import { Field, fieldInputClass } from "../ui/FormField";
import { SubmitButton } from "../ui/SubmitButton";

type Status = "idle" | "submitting" | "success" | "error";

const initialForm = { name: "", phone: "", email: "", message: "", website: "" };

export function InquiryForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = (field: keyof typeof initialForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Honeypot: real visitors never fill this (hidden below). If it has a
    // value, treat the submission as spam without hitting the network.
    if (form.website.trim().length > 0) {
      setStatus("success");
      setForm(initialForm);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await api.submitInquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        message: form.message.trim(),
      });
      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : "Something went wrong. Please try calling the clinic directly.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-6 w-6 text-cyan-glow" />
        <p className="text-sm font-semibold text-white">Message sent — we'll be in touch.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-xs font-semibold uppercase tracking-wider text-cyan-glow hover:text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex items-center gap-2 text-cyan-glow">
        <MessageCircle className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Have a Question?</p>
      </div>

      {/* Honeypot field — hidden from real users, visible to naive bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={update("website")}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" htmlFor="inquiry-name" required>
          <input
            id="inquiry-name"
            required
            minLength={2}
            maxLength={120}
            value={form.name}
            onChange={update("name")}
            placeholder="Your name"
            className={fieldInputClass}
          />
        </Field>
        <Field label="Phone" htmlFor="inquiry-phone" required>
          <input
            id="inquiry-phone"
            type="tel"
            required
            value={form.phone}
            onChange={update("phone")}
            placeholder="03XX XXXXXXX"
            className={fieldInputClass}
          />
        </Field>
      </div>

      <Field label="Email (optional)" htmlFor="inquiry-email">
        <input
          id="inquiry-email"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
          className={fieldInputClass}
        />
      </Field>

      <Field label="Message" htmlFor="inquiry-message" required>
        <textarea
          id="inquiry-message"
          required
          minLength={2}
          maxLength={1000}
          rows={3}
          value={form.message}
          onChange={update("message")}
          placeholder="How can we help?"
          className={`${fieldInputClass} resize-none`}
        />
      </Field>

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <SubmitButton loading={status === "submitting"} variant="secondary" className="w-full sm:w-fit">
        {status === "submitting" ? "Sending…" : "Send Message"}
      </SubmitButton>
    </form>
  );
}
