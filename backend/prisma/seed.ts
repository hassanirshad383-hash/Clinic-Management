import { PrismaClient, ServiceCategory } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Content mirrors what's already published on the public website
// (ultrasound-website/src/utils/data.ts) — nothing invented here.
const services: Array<{
  name: string;
  slug: string;
  category: ServiceCategory;
  shortDescription: string;
  areas: string[];
  displayOrder: number;
}> = [
  {
    name: 'General Ultrasound',
    slug: 'general-ultrasound',
    category: ServiceCategory.GENERAL,
    shortDescription:
      'Detailed abdominal and pelvic ultrasound assessment for a broad range of clinical concerns.',
    areas: ['Abdomen & Pelvis', 'Hepatobiliary system', 'Kidneys & urinary tract', 'Spleen', 'Retroperitoneum'],
    displayOrder: 1,
  },
  {
    name: 'Obstetric Ultrasound',
    slug: 'obstetric-ultrasound',
    category: ServiceCategory.OBSTETRIC,
    shortDescription:
      'Pregnancy imaging performed with care, covering early assessment through fetal growth and wellbeing.',
    areas: ['Early pregnancy assessment', 'Pregnancy ultrasound', 'Fetal assessment', 'Growth and wellbeing assessment'],
    displayOrder: 2,
  },
  {
    name: 'Gynecological Ultrasound',
    slug: 'gynecological-ultrasound',
    category: ServiceCategory.GYNECOLOGICAL,
    shortDescription:
      'Comprehensive pelvic imaging to assess the uterus, ovaries, and surrounding structures.',
    areas: ['Uterus', 'Ovaries', 'Adnexa', 'Pelvic assessment'],
    displayOrder: 3,
  },
  {
    name: 'Small Parts Ultrasound',
    slug: 'small-parts-ultrasound',
    category: ServiceCategory.SMALL_PARTS,
    shortDescription:
      'High-resolution imaging of superficial structures for accurate, focused evaluation.',
    areas: ['Thyroid', 'Breast', 'Neck', 'Soft tissues'],
    displayOrder: 4,
  },
  {
    name: 'Scrotal Ultrasound',
    slug: 'scrotal-ultrasound',
    category: ServiceCategory.SCROTAL,
    shortDescription:
      'Careful scrotal imaging with Doppler assessment where clinically indicated.',
    areas: ['Testes', 'Epididymis', 'Scrotal structures', 'Doppler assessment'],
    displayOrder: 5,
  },
  {
    name: 'Musculoskeletal Ultrasound',
    slug: 'musculoskeletal-ultrasound',
    category: ServiceCategory.MUSCULOSKELETAL,
    shortDescription:
      'Dynamic assessment of tendons, muscles, and joints for musculoskeletal concerns.',
    areas: ['Tendons', 'Muscles', 'Joints', 'Soft tissues'],
    displayOrder: 6,
  },
  {
    name: 'Vascular Doppler',
    slug: 'vascular-doppler',
    category: ServiceCategory.VASCULAR,
    shortDescription:
      'Doppler evaluation of arterial and venous flow to support vascular assessment.',
    areas: ['Arterial Doppler', 'Venous Doppler', 'Lower limb Doppler', 'Vascular assessment'],
    displayOrder: 7,
  },
  {
    name: 'Renal & Urinary Ultrasound',
    slug: 'renal-urinary-ultrasound',
    category: ServiceCategory.RENAL_URINARY,
    shortDescription:
      'Focused imaging of the kidneys and urinary tract, including prostate assessment where appropriate.',
    areas: ['Kidneys', 'Urinary bladder', 'Prostate assessment where appropriate'],
    displayOrder: 8,
  },
  {
    name: 'Pediatric Ultrasound',
    slug: 'pediatric-ultrasound',
    category: ServiceCategory.PEDIATRIC,
    shortDescription:
      'Gentle, patient-focused ultrasound imaging tailored to younger patients.',
    areas: ['Abdominal ultrasound', 'Renal ultrasound', 'Soft tissue assessment'],
    displayOrder: 9,
  },
  {
    name: 'Ultrasound Doppler',
    slug: 'ultrasound-doppler',
    category: ServiceCategory.DOPPLER,
    shortDescription:
      'Color and spectral Doppler studies supporting arterial and venous evaluation.',
    areas: ['Color Doppler', 'Spectral Doppler', 'Arterial studies', 'Venous studies'],
    displayOrder: 10,
  },
];

async function seedClinic() {
  await prisma.clinicSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Irfan Diagnostic Centre',
      addressLine1: 'Stadium Road',
      addressLine2: 'Opposite Civil Hospital, Daska',
      hours: '10:00 AM – 3:00 PM',
      phoneDisplay: '0332 5445555',
      phoneHref: 'tel:+923325445555',
    },
  });
  console.log('Clinic settings seeded.');
}

async function seedServices() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        name: service.name,
        slug: service.slug,
        category: service.category,
        shortDescription: service.shortDescription,
        description: `${service.shortDescription} Areas assessed include: ${service.areas.join(', ')}.`,
        isActive: true,
        displayOrder: service.displayOrder,
      },
    });
  }
  console.log(`${services.length} ultrasound services seeded.`);
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Administrator';

  if (!email || !password) {
    console.warn(
      'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin ' +
        'account creation. Set both in your .env and re-run `npm run db:seed` ' +
        'to create the first SUPER_ADMIN. No default admin password is ever created.',
    );
    return;
  }

  if (password.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters long.');
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }

  const passwordHash = await argon2.hash(password);
  await prisma.adminUser.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`SUPER_ADMIN account created for ${email}.`);
}

async function main() {
  await seedClinic();
  await seedServices();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
