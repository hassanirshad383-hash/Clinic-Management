import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { services as staticServices, type Service } from "../utils/data";

// Maps live API slugs back to the static catalog's short ids, so icons
// (keyed by short id in utils/icons.ts) and the "areas assessed" lists
// (not modeled by the API yet) keep working once services come from the
// admin-managed backend instead of this file.
const slugToStaticId: Record<string, string> = {
  "general-ultrasound": "general",
  "obstetric-ultrasound": "obstetric",
  "gynecological-ultrasound": "gynecological",
  "small-parts-ultrasound": "small-parts",
  "scrotal-ultrasound": "scrotal",
  "musculoskeletal-ultrasound": "musculoskeletal",
  "vascular-doppler": "vascular",
  "renal-urinary-ultrasound": "renal",
  "pediatric-ultrasound": "pediatric",
  "ultrasound-doppler": "doppler",
};

const areasByStaticId = new Map(staticServices.map((service) => [service.id, service.areas]));

interface ApiServiceLike {
  name: string;
  slug: string;
  shortDescription: string;
  isActive: boolean;
  displayOrder: number;
}

function mergeWithStatic(apiServices: ApiServiceLike[]): Service[] {
  const merged = apiServices
    .filter((service) => service.isActive)
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((service) => {
      const id = slugToStaticId[service.slug] ?? service.slug;
      return {
        id,
        name: service.name,
        description: service.shortDescription,
        areas: areasByStaticId.get(id) ?? [],
      };
    });

  return merged.length > 0 ? merged : staticServices;
}

let cached: Service[] | null = null;
let inFlight: Promise<Service[]> | null = null;

function fetchServices(): Promise<Service[]> {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = api
      .getServices()
      .then((data) => {
        cached = data.length > 0 ? mergeWithStatic(data) : staticServices;
        return cached;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/**
 * Ultrasound services for the Services section. Starts from the static
 * catalog (always correct today) and upgrades to the live, admin-managed
 * list if the API responds.
 */
export function useServices(): Service[] {
  const [list, setList] = useState<Service[]>(cached ?? staticServices);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    fetchServices()
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch(() => {
        // API unreachable — keep the static fallback list.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return list;
}

