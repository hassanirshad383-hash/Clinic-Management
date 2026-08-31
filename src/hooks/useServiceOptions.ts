import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { services as staticServices } from "../utils/data";

const fallbackNames = staticServices.map((service) => service.name);

let cached: string[] | null = null;
let inFlight: Promise<string[]> | null = null;

function fetchServiceNames(): Promise<string[]> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = api
      .getServices()
      .then((data) => {
        cached = data.length > 0 ? data.map((service) => service.name) : fallbackNames;
        return cached;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * Names of active ultrasound services, for the appointment request form's
 * service picker. Starts from the static catalog (always correct today)
 * and upgrades to the live, admin-managed list if the API responds.
 */
export function useServiceOptions(): string[] {
  const [names, setNames] = useState<string[]>(cached ?? fallbackNames);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    fetchServiceNames()
      .then((data) => {
        if (!cancelled) setNames(data);
      })
      .catch(() => {
        // API unreachable — keep the static fallback list.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return names;
}
