import { useState } from "react";

const WHATSAPP_NUMBER = "923325445555";
const DEFAULT_MESSAGE = "Hi, I'd like to book an ultrasound appointment.";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 sm:bottom-8 sm:right-8"
    >
      <span
        className={`hidden whitespace-nowrap rounded-full glass px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 sm:block ${
          hovered ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
        }`}
      >
        Chat with us
      </span>

      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.55)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(37,211,102,0.75)]">
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/60" />
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="h-7 w-7 text-white"
          aria-hidden="true"
        >
          <path d="M16.004 0C7.163 0 0 7.163 0 16c0 2.9.79 5.702 2.287 8.15L.06 31.94l7.98-2.192A15.9 15.9 0 0 0 16.004 32C24.84 32 32 24.837 32 16S24.84 0 16.004 0Zm0 29.09a13.04 13.04 0 0 1-6.65-1.83l-.478-.286-4.735 1.3 1.267-4.62-.31-.475A13.06 13.06 0 0 1 2.91 16c0-7.22 5.874-13.09 13.094-13.09 7.219 0 13.09 5.87 13.09 13.09 0 7.22-5.871 13.09-13.09 13.09Zm7.17-9.803c-.393-.196-2.323-1.147-2.683-1.278-.36-.132-.622-.196-.884.196-.262.393-1.014 1.278-1.243 1.54-.229.262-.458.295-.85.099-.393-.197-1.658-.611-3.158-1.949-1.167-1.04-1.955-2.325-2.184-2.717-.229-.393-.024-.606.17-.802.196-.196.44-.508.66-.762.22-.253.293-.437.44-.729.147-.293.073-.545-.05-.762-.123-.216-1.105-2.667-1.512-3.651-.4-.965-.809-.834-1.111-.85-.284-.014-.61-.017-.936-.017-.327 0-.856.123-1.166.605-.31.483-1.187 1.164-1.187 2.834 0 1.67 1.213 3.285 1.383 3.514.17.229 2.352 3.596 5.702 4.898 3.35 1.303 3.35.868 3.953.816.605-.052 1.953-.798 2.229-1.573.277-.774.277-1.437.194-1.573-.083-.135-.302-.216-.633-.379Z" />
        </svg>
      </span>
    </a>
  );
}
