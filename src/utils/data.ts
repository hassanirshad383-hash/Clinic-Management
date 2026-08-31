export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Why Choose Us", href: "#why-choose-us" },
  { label: "Clinic", href: "#clinic" },
  { label: "Contact", href: "#contact" },
];

export const clinic = {
  name: "Irfan Diagnostic Centre",
  hours: "10:00 AM – 3:00 PM",
  addressLine1: "Stadium Road",
  addressLine2: "Opposite Civil Hospital, Daska",
  fullAddress: "Stadium Road, Opposite Civil Hospital, Daska",
  phoneDisplay: "0332 5445555",
  phoneHref: "tel:+923325445555",
};

export const doctor = {
  name: "Dr. Hassan Irshad",
  title: "Consultant Radiologist",
};

export interface Service {
  id: string;
  name: string;
  description: string;
  areas: string[];
}

export const services: Service[] = [
  {
    id: "general",
    name: "General Ultrasound",
    description:
      "Detailed abdominal and pelvic ultrasound assessment for a broad range of clinical concerns.",
    areas: ["Abdomen & Pelvis", "Hepatobiliary system", "Kidneys & urinary tract", "Spleen", "Retroperitoneum"],
  },
  {
    id: "obstetric",
    name: "Obstetric Ultrasound",
    description:
      "Pregnancy imaging performed with care, covering early assessment through fetal growth and wellbeing.",
    areas: ["Early pregnancy assessment", "Pregnancy ultrasound", "Fetal assessment", "Growth and wellbeing assessment"],
  },
  {
    id: "gynecological",
    name: "Gynecological Ultrasound",
    description:
      "Comprehensive pelvic imaging to assess the uterus, ovaries, and surrounding structures.",
    areas: ["Uterus", "Ovaries", "Adnexa", "Pelvic assessment"],
  },
  {
    id: "small-parts",
    name: "Small Parts Ultrasound",
    description:
      "High-resolution imaging of superficial structures for accurate, focused evaluation.",
    areas: ["Thyroid", "Breast", "Neck", "Soft tissues"],
  },
  {
    id: "scrotal",
    name: "Scrotal Ultrasound",
    description:
      "Careful scrotal imaging with Doppler assessment where clinically indicated.",
    areas: ["Testes", "Epididymis", "Scrotal structures", "Doppler assessment"],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal Ultrasound",
    description:
      "Dynamic assessment of tendons, muscles, and joints for musculoskeletal concerns.",
    areas: ["Tendons", "Muscles", "Joints", "Soft tissues"],
  },
  {
    id: "vascular",
    name: "Vascular Doppler",
    description:
      "Doppler evaluation of arterial and venous flow to support vascular assessment.",
    areas: ["Arterial Doppler", "Venous Doppler", "Lower limb Doppler", "Vascular assessment"],
  },
  {
    id: "renal",
    name: "Renal & Urinary Ultrasound",
    description:
      "Focused imaging of the kidneys and urinary tract, including prostate assessment where appropriate.",
    areas: ["Kidneys", "Urinary bladder", "Prostate assessment where appropriate"],
  },
  {
    id: "pediatric",
    name: "Pediatric Ultrasound",
    description:
      "Gentle, patient-focused ultrasound imaging tailored to younger patients.",
    areas: ["Abdominal ultrasound", "Renal ultrasound", "Soft tissue assessment"],
  },
  {
    id: "doppler",
    name: "Ultrasound Doppler",
    description:
      "Color and spectral Doppler studies supporting arterial and venous evaluation.",
    areas: ["Color Doppler", "Spectral Doppler", "Arterial studies", "Venous studies"],
  },
];

export interface WhyChooseItem {
  title: string;
  description: string;
}

export const whyChooseUs: WhyChooseItem[] = [
  {
    title: "Comprehensive Ultrasound Care",
    description: "A wide range of ultrasound examinations under one roof.",
  },
  {
    title: "Careful Imaging",
    description: "Detailed and systematic ultrasound assessment.",
  },
  {
    title: "Clear Reporting",
    description: "Professional and understandable reporting.",
  },
  {
    title: "Patient-Focused Approach",
    description: "A comfortable and respectful experience for every patient.",
  },
];

export interface JourneyStep {
  number: string;
  title: string;
}

export const journeySteps: JourneyStep[] = [
  { number: "01", title: "Choose Your Examination" },
  { number: "02", title: "Visit the Clinic" },
  { number: "03", title: "Ultrasound Examination" },
  { number: "04", title: "Professional Reporting" },
];

export const aboutHighlights = ["Comprehensive Ultrasound", "Detailed Imaging", "Patient-Centered Care"];

export const disclaimer =
  "Information provided on this website is for general informational purposes and does not constitute medical advice. Please consult an appropriate healthcare professional regarding your individual medical needs.";
