import { useState, type FormEvent } from "react";
import { CalendarCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ApiRequestError } from "../../lib/api";
import { useServiceOptions } from "../../hooks/useServiceOptions";
import { Field, fieldInputClass } from "../ui/FormField";
import { SubmitButton } from "../ui/SubmitButton";

type Status = "idle" | "submitting" | "success" | "error";

const initialForm = {
  patientName: "",
  patientPhone: "",
  requestedService: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
};

export function AppointmentForm() {
  const serviceOptions = useServiceOptions();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = (field: keyof typeof initialForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      await api.submitAppointment({
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        requestedService: form.requestedService || serviceOptions[0] || "General Ultrasound",
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime.trim() || undefined,
        message: form.message.trim() || undefined,
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
      <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-glow/10 text-cyan-glow">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="font-display text-lg font-semibold text-white">Request Received</p>
        <p className="max-w-xs text-sm leading-relaxed text-mist/65">
          Thank you. This is a request, not a confirmed booking — our team will contact you
          shortly to confirm your appointment.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-xs font-semibold uppercase tracking-wider text-cyan-glow hover:text-white"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center gap-2 text-cyan-glow">
        <CalendarCheck className="h-5 w-5" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Request an Appointment</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="patientName" required>
          <input
            id="patientName"
            required
            minLength={2}
            maxLength={120}
            value={form.patientName}
            onChange={update("patientName")}
            placeholder="Your name"
            className={fieldInputClass}
          />
        </Field>

        <Field label="Phone Number" htmlFor="patientPhone" required>
          <input
            id="patientPhone"
            type="tel"
            required
            value={form.patientPhone}
            onChange={update("patientPhone")}
            placeholder="03XX XXXXXXX"
            className={fieldInputClass}
          />
        </Field>
      </div>

      <Field label="Ultrasound Service" htmlFor="requestedService" required>
        <select
          id="requestedService"
          required
          value={form.requestedService}
          onChange={update("requestedService")}
          className={`${fieldInputClass} appearance-none`}
        >
          <option value="" disabled>
            Select a service
          </option>
          {serviceOptions.map((name) => (
            <option key={name} value={name} className="bg-navy-900">
              {name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Preferred Date" htmlFor="preferredDate">
          <input
            id="preferredDate"
            type="date"
            value={form.preferredDate}
            onChange={update("preferredDate")}
            className={`${fieldInputClass} [color-scheme:dark]`}
          />
        </Field>

        <Field label="Preferred Time" htmlFor="preferredTime">
          <input
            id="preferredTime"
            value={form.preferredTime}
            onChange={update("preferredTime")}
            placeholder="e.g. 11:00 AM"
            maxLength={30}
            className={fieldInputClass}
          />
        </Field>
      </div>

      <Field label="Message (optional)" htmlFor="message">
        <textarea
          id="message"
          rows={3}
          maxLength={500}
          value={form.message}
          onChange={update("message")}
          placeholder="Anything the clinic should know?"
          className={`${fieldInputClass} resize-none`}
        />
      </Field>

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <SubmitButton loading={status === "submitting"} className="w-full sm:w-fit">
        {status === "submitting" ? "Sending Request…" : "Send Appointment Request"}
      </SubmitButton>

      <p className="text-xs text-mist/40">
        This submits a request only — an admin will contact you to confirm your appointment.
      </p>
    </form>
  );
}
