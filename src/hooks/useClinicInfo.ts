import { useEffect, useState } from "react";
import { api, type ApiClinicInfo } from "../lib/api";
import { clinic as staticClinic } from "../utils/data";

export interface ClinicInfo {
  name: string;
  hours: string;
  addressLine1: string;
  addressLine2: string;
  fullAddress: string;
  phoneDisplay: string;
  phoneHref: string;
}

function toClinicInfo(raw: ApiClinicInfo): ClinicInfo {
  return {
    name: raw.name,
    hours: raw.hours,
    addressLine1: raw.addressLine1,
    addressLine2: raw.addressLine2,
    fullAddress: `${raw.addressLine1}, ${raw.addressLine2}`,
    phoneDisplay: raw.phoneDisplay ?? staticClinic.phoneDisplay,
    phoneHref: raw.phoneHref ?? staticClinic.phoneHref,
  };
}

// Several sections on the page use this hook at once (Hero, Clinic,
// Contact, Footer). Share one in-flight request across all of them instead
// of firing a GET /clinic per component.
let cached: ClinicInfo | null = null;
let inFlight: Promise<ClinicInfo> | null = null;

function fetchClinicInfo(): Promise<ClinicInfo> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = api
      .getClinic()
      .then((data) => {
        cached = toClinicInfo(data);
        return cached;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * Renders the known-good static clinic details immediately (no loading
 * flash), then quietly swaps in live data from the API if it responds.
 * If the API is unreachable, the static fallback simply stays — nothing
 * on the page ever breaks because the backend is down.
 */
export function useClinicInfo(): ClinicInfo {
  const [info, setInfo] = useState<ClinicInfo>(cached ?? staticClinic);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    fetchClinicInfo()
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        // API unreachable or not yet deployed — keep the static fallback.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}
