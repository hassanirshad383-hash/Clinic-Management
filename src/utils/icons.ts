import {
  Activity,
  Baby,
  Bone,
  CircleDot,
  Heart,
  Scan,
  ShieldPlus,
  Stethoscope,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

export const serviceIcons: Record<string, LucideIcon> = {
  general: Scan,
  obstetric: Baby,
  gynecological: Heart,
  "small-parts": ShieldPlus,
  scrotal: CircleDot,
  musculoskeletal: Bone,
  vascular: Activity,
  renal: Stethoscope,
  pediatric: Users,
  doppler: Waves,
};
