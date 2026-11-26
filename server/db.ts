import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { hashPassword } from './auth.ts';
import type { DatabaseSchema, Tribe } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads');

function useNetlifyBlobs(): boolean {
  return process.env.NETLIFY === 'true' || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
}

const TWELVE_TRIBES_NAMES = [
  'Reuben',
  'Simeon',
  'Levi',
  'Judah',
  'Dan',
  'Naphtali',
  'Gad',
  'Asher',
  'Issachar',
  'Zebulun',
  'Joseph',
  'Benjamin',
] as const;

function createSeedDatabase(): DatabaseSchema {
  const now = new Date().toISOString();

  const tribes: Tribe[] = TWELVE_TRIBES_NAMES.map((name, index) => ({
    id: `tribe-${name.toLowerCase()}`,
    name,
    order: index + 1,
    headName: '',
    headPhotoUrl: null,
    introduction: `A vibrant fellowship family within Chapel of Glory, Arthur Jarvis University. Connect with the Tribe of ${name} for discipleship, prayer, care, and campus belonging.`,
    phone: '',
    whatsapp: '',
    updatedAt: now,
  }));

  const albums = [
    {
      id: 'album-sunday-services',
      name: 'Sunday Services',
      description: 'Weekly Sunday worship gatherings at 8:00 AM.',
      createdAt: now,
    },
    {
      id: 'album-worship-sessions',
      name: 'Worship Sessions',
      description: 'Atmospheres of heartfelt praise and spiritual devotion.',
      createdAt: now,
    },
    {
      id: 'album-shekinah-night',
      name: 'Shekinah Night',
      description: 'Nights of glory, intense worship, and spiritual encounter.',
      createdAt: now,
    },
    {
      id: 'album-prayer-conferences',
      name: 'Prayer Conferences',
      description: 'Strategic gatherings of intercession and spiritual renewal.',
      createdAt: now,
    },
    {
      id: 'album-prayer-summits',
      name: 'Prayer Summits',
      description: 'Prayer Flame Summit moments of fire, word, and alignment.',
      createdAt: now,
    },
    {
      id: 'album-special-events',
      name: 'Special Events',
      description: 'Prayer Sunday, campus revivals, and special convocations.',
      createdAt: now,
    },
    {
      id: 'album-church-fellowship',
      name: 'Church Fellowship',
      description: 'Community, Twelve Tribes family moments, and campus life.',
      createdAt: now,
    },
  ];

  return {
    users: [
      {
        id: 'admin-super-1',
        name: 'Chapel Administrator',
        email: 'admin@chapelofglory.org',
        role: 'super_admin',
        passwordHash: hashPassword('ChapelAdmin@2026'),
        createdAt: now,
      },
      {
        id: 'admin-editor-1',
        name: 'Media & Communications',
        email: 'media@chapelofglory.org',
        role: 'editor',
        passwordHash: hashPassword('ChapelMedia@2026'),
        createdAt: now,
      },
    ],
    leaders: [
      {
        id: 'leader-head-chaplain',
        fullName: 'Rev. Samuel Bassey',
        position: 'Head Chaplain',
        bio: 'Official biography to be updated by the Chapel of Glory Office.',
        photoUrl: null,
        contactInfo: '',
        displayOrder: 1,
        updatedAt: now,
      },
      {
        id: 'leader-assistant-chaplain',
        fullName: 'Pst. Joseph Odeh',
        position: 'Assistant Chaplain',
        bio: 'Official biography to be updated by the Chapel of Glory Office.',
        photoUrl: null,
        contactInfo: '',
        displayOrder: 2,
        updatedAt: now,
      },
    ],
    programmes: [
      {
        id: 'prog-sunday-service',
        title: 'Sunday Service',
        slug: 'sunday-service',
        schedule: 'Sunday, 8:00 AM',
        description:
          'Our flagship weekly gathering of worship, prayer, and the living Word of God for the Arthur Jarvis University community.',
        details:
          'Join the entire Chapel of Glory family every Sunday morning at 8:00 AM for uplifting worship, fervent intercession, and sound biblical teaching. Special Prayer Sunday editions carry a focused charge of spiritual renewal.',
        theme: 'fiery-red',
        imageUrl: '/images/prayer-sunday.jpg',
        isFeatured: true,
        displayOrder: 1,
        updatedAt: now,
      },
      {
        id: 'prog-bible-study',
        title: 'Bible Study',
        slug: 'bible-study',
        schedule: 'Day & time to be announced',
        description:
          'Deep, interactive study of Scripture designed to ground believers in truth, wisdom, and daily Christian living.',
        details:
          'Schedule details will be updated by the Chapel Office. Come with your Bible and an expectant heart as we grow in sound doctrine and spiritual maturity together.',
        theme: 'electric-blue',
        imageUrl: '/images/fellowship-bible.jpg',
        isFeatured: false,
        displayOrder: 2,
        updatedAt: now,
      },
      {
        id: 'prog-shekinah-night',
        title: 'Shekinah Night',
        slug: 'shekinah-night',
        schedule: 'Time to be announced',
        description:
          'An extraordinary night of worship, glory, and unhurried fellowship in the manifest presence of God.',
        details:
          'Shekinah Night gathers students, staff, and believers across campus for an atmosphere of prophetic worship, prayer, and spiritual encounter. Official date and time will be announced.',
        theme: 'fiery-red',
        imageUrl: '/images/shekinah-night-logo.png',
        isFeatured: false,
        displayOrder: 3,
        updatedAt: now,
      },
      {
        id: 'prog-prayer-conference',
        title: 'Prayer Conference',
        slug: 'prayer-conference',
        schedule: 'Time to be announced',
        description:
          'A dedicated convocation of fervent intercession, spiritual alignment, and empowerment for the university community.',
        details:
          'Focused sessions of corporate prayer, worship, and word ministry equipping believers to walk in spiritual authority. Official schedule will be published by the Chapel Office.',
        theme: 'electric-blue',
        imageUrl: '/images/hero-sanctuary.jpg',
        isFeatured: false,
        displayOrder: 4,
        updatedAt: now,
      },
      {
        id: 'prog-prayer-summit',
        title: 'Prayer Summit',
        slug: 'prayer-summit',
        schedule: 'Time to be announced',
        description:
          'Our signature Prayer Flame Summit — igniting passion, purpose, and sustained prayer fire across the generation.',
        details:
          'Inspired by the Prayer Flame Summit mandate, this gathering raises a generation of intercessors and kingdom leaders at Arthur Jarvis University. Official dates to be announced.',
        theme: 'electric-blue',
        imageUrl: '/images/prayer-summit.jpg',
        isFeatured: true,
        displayOrder: 5,
        updatedAt: now,
      },
    ],
    tribes,
    registrations: [],
    albums,
    photos: [
      {
        id: 'photo-seed-1',
        albumId: 'album-worship-sessions',
        title: 'Sanctuary Worship Atmosphere',
        caption: 'Sanctuary lighting during corporate worship at Chapel of Glory.',
        imageUrl: '/images/hero-sanctuary.jpg',
        createdAt: now,
      },
      {
        id: 'photo-seed-2',
        albumId: 'album-prayer-summits',
        title: 'Prayer Flame Summit Ambience',
        caption: 'Radiant light rays and expectant prayer atmosphere.',
        imageUrl: '/images/prayer-summit.jpg',
        createdAt: now,
      },
      {
        id: 'photo-seed-3',
        albumId: 'album-special-events',
        title: 'Prayer Sunday Edition',
        caption: 'Event lighting for Prayer Sunday at 8:00 AM.',
        imageUrl: '/images/prayer-sunday.jpg',
        createdAt: now,
      },
      {
        id: 'photo-seed-4',
        albumId: 'album-church-fellowship',
        title: 'The Word & Fellowship',
        caption: 'Scripture and quiet reflection inside the university chapel.',
        imageUrl: '/images/fellowship-bible.jpg',
        createdAt: now,
      },
      {
        id: 'photo-seed-5',
        albumId: 'album-shekinah-night',
        title: 'Shekinah Night Official Emblem',
        caption: 'Official visual emblem for Chapel of Glory Shekinah Night.',
        imageUrl: '/images/shekinah-night-logo.png',
        createdAt: now,
      },
    ],
    contactMessages: [],
    announcements: [
      {
        id: 'ann-sunday-service',
        title: 'Sunday Service — 8:00 AM',
        message:
          'Join us this Sunday at Arthur Jarvis University Campus Chapel for worship, prayer, and the Word.',
        badge: 'Weekly',
        placement: 'hero-card',
        linkLabel: 'Programmes',
        linkTo: '/programmes',
        active: true,
        updatedAt: now,
      },
    ],
    settings: {
      phone: '+234 907 052 1282',
      whatsapp: '2349070521282',
      email: 'chapelofglory@arthurjarvisuniversity.edu.ng (placeholder)',
      address: 'Chapel of Glory, Arthur Jarvis University Campus (exact hall address to be updated)',
      socialHandle: '@CHAPEL OF GLORY',
      instagramUrl: '',
      telegramUrl: '',
    },
  };
}

function normalizeDb(parsed: DatabaseSchema): DatabaseSchema {
  if (!Array.isArray(parsed.announcements)) {
    parsed.announcements = [
      {
        id: 'ann-sunday-service',
        title: 'Sunday Service — 8:00 AM',
        message:
          'Join us this Sunday at Arthur Jarvis University Campus Chapel for worship, prayer, and the Word.',
        badge: 'Weekly',
        placement: 'hero-card',
        linkLabel: 'Programmes',
        linkTo: '/programmes',
        active: true,
        updatedAt: new Date().toISOString(),
      },
    ];
  }
  return parsed;
}

export async function readDb(): Promise<DatabaseSchema> {
  if (useNetlifyBlobs()) {
    const store = getStore('chapel-of-glory-data');
    const existing = (await store.get('db', { type: 'json' })) as DatabaseSchema | null;
    if (!existing) {
      const seed = createSeedDatabase();
      await store.setJSON('db', seed);
      return seed;
    }
    return normalizeDb(existing);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = createSeedDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return normalizeDb(JSON.parse(raw) as DatabaseSchema);
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  if (useNetlifyBlobs()) {
    const store = getStore('chapel-of-glory-data');
    await store.setJSON('db', data);
    return;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${DB_PATH}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_PATH);
}

export async function saveUploadedImage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (useNetlifyBlobs()) {
    const store = getStore('chapel-of-glory-uploads');
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    await store.set(filename, arrayBuffer, { metadata: { contentType } });
    return `/uploads/${filename}`;
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function readUploadedImage(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safeName = path.basename(filename);

  if (useNetlifyBlobs()) {
    const store = getStore('chapel-of-glory-uploads');
    const result = await store.getWithMetadata(safeName, { type: 'arrayBuffer' });
    if (!result || !result.data) return null;
    const contentType =
      (result.metadata?.contentType as string | undefined) || 'application/octet-stream';
    return { buffer: Buffer.from(result.data), contentType };
  }

  const fullPath = path.join(UPLOADS_DIR, safeName);
  if (!fs.existsSync(fullPath)) return null;
  const ext = path.extname(safeName).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return {
    buffer: fs.readFileSync(fullPath),
    contentType: mimeMap[ext] || 'application/octet-stream',
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
