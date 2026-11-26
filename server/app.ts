import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  readDb,
  writeDb,
  generateId,
  saveUploadedImage,
  readUploadedImage,
} from './db.ts';
import {
  verifyPassword,
  hashPassword,
  createSessionToken,
  verifySessionToken,
  requireAuth,
  SESSION_COOKIE_NAME,
  type AuthenticatedRequest,
} from './auth.ts';
import type {
  SafeAdminUser,
  ProgrammeTheme,
  RegistrationStatus,
  ContactStatus,
  AdminRole,
  AnnouncementPlacement,
} from './types.ts';

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '6mb' }));
app.use(cookieParser());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}): SafeAdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// ---------- SERVE UPLOADED IMAGES (LOCAL DISK OR NETLIFY BLOBS) ----------
app.get('/uploads/:filename', async (req, res) => {
  try {
    const file = await readUploadedImage(req.params.filename);
    if (!file) {
      res.status(404).send('Not found');
      return;
    }
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(file.buffer);
  } catch {
    res.status(500).send('Unable to load image');
  }
});

// ---------- HEALTH ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Chapel of Glory API' });
});

// ---------- AUTH ----------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = await readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const safeUser = toSafeUser(user);
  const token = createSessionToken(safeUser);
  const isProd = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.json({ user: safeUser, token });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;
  const payload = verifySessionToken(cookieToken || bearerToken);
  if (!payload) {
    res.json({ user: null });
    return;
  }
  const db = await readDb();
  const user = db.users.find((u) => u.id === payload.userId);
  res.json({ user: user ? toSafeUser(user) : null });
});

// ---------- UPLOAD ----------
app.post('/api/upload', requireAuth(), upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided.' });
    return;
  }
  const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
  const url = await saveUploadedImage(filename, req.file.buffer, req.file.mimetype);
  res.json({ url });
});

// ---------- PUBLIC SITE DATA ----------
app.get('/api/site', async (_req, res) => {
  const db = await readDb();
  res.json({
    settings: db.settings,
    leaders: [...db.leaders].sort((a, b) => a.displayOrder - b.displayOrder),
    programmes: [...db.programmes].sort((a, b) => a.displayOrder - b.displayOrder),
    tribes: [...db.tribes].sort((a, b) => a.order - b.order),
    albums: db.albums,
    photos: [...db.photos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    announcements: [...db.announcements].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  });
});

// ---------- ANNOUNCEMENTS ----------
const VALID_PLACEMENTS: AnnouncementPlacement[] = [
  'hero-card',
  'top-banner',
  'programmes-page',
  'tribes-page',
];

app.get('/api/announcements', async (_req, res) => {
  const db = await readDb();
  res.json(
    [...db.announcements].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  );
});

app.post('/api/announcements', requireAuth(), async (req, res) => {
  const { title, message, badge, placement, linkLabel, linkTo, active } = req.body as {
    title?: string;
    message?: string;
    badge?: string;
    placement?: AnnouncementPlacement;
    linkLabel?: string;
    linkTo?: string;
    active?: boolean;
  };

  if (!title?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Announcement title and message are required.' });
    return;
  }

  const db = await readDb();
  const item = {
    id: generateId('ann'),
    title: title.trim(),
    message: message.trim(),
    badge: (badge || '').trim(),
    placement: (placement && VALID_PLACEMENTS.includes(placement)
      ? placement
      : 'hero-card') as AnnouncementPlacement,
    linkLabel: (linkLabel || '').trim(),
    linkTo: (linkTo || '').trim(),
    active: active !== undefined ? Boolean(active) : true,
    updatedAt: new Date().toISOString(),
  };
  db.announcements.unshift(item);
  await writeDb(db);
  res.status(201).json(item);
});

app.put('/api/announcements/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.announcements.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }
  const existing = db.announcements[idx];
  const { title, message, badge, placement, linkLabel, linkTo, active } = req.body as {
    title?: string;
    message?: string;
    badge?: string;
    placement?: AnnouncementPlacement;
    linkLabel?: string;
    linkTo?: string;
    active?: boolean;
  };

  db.announcements[idx] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    message: message !== undefined ? message.trim() : existing.message,
    badge: badge !== undefined ? badge.trim() : existing.badge,
    placement:
      placement && VALID_PLACEMENTS.includes(placement) ? placement : existing.placement,
    linkLabel: linkLabel !== undefined ? linkLabel.trim() : existing.linkLabel,
    linkTo: linkTo !== undefined ? linkTo.trim() : existing.linkTo,
    active: active !== undefined ? Boolean(active) : existing.active,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  res.json(db.announcements[idx]);
});

app.delete('/api/announcements/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.announcements.length;
  db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
  if (db.announcements.length === before) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- LEADERS ----------
app.get('/api/leaders', async (_req, res) => {
  const db = await readDb();
  res.json([...db.leaders].sort((a, b) => a.displayOrder - b.displayOrder));
});

app.post('/api/leaders', requireAuth(), async (req, res) => {
  const { fullName, position, bio, photoUrl, contactInfo, displayOrder } = req.body as {
    fullName?: string;
    position?: string;
    bio?: string;
    photoUrl?: string | null;
    contactInfo?: string;
    displayOrder?: number;
  };
  if (!fullName?.trim() || !position?.trim()) {
    res.status(400).json({ error: 'Full name and official position are required.' });
    return;
  }

  const db = await readDb();
  const leader = {
    id: generateId('leader'),
    fullName: fullName.trim(),
    position: position.trim(),
    bio: (bio || '').trim(),
    photoUrl: photoUrl || null,
    contactInfo: (contactInfo || '').trim(),
    displayOrder: typeof displayOrder === 'number' ? displayOrder : db.leaders.length + 1,
    updatedAt: new Date().toISOString(),
  };
  db.leaders.push(leader);
  await writeDb(db);
  res.status(201).json(leader);
});

app.put('/api/leaders/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.leaders.findIndex((l) => l.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Leader profile not found.' });
    return;
  }
  const existing = db.leaders[idx];
  const { fullName, position, bio, photoUrl, contactInfo, displayOrder } = req.body as {
    fullName?: string;
    position?: string;
    bio?: string;
    photoUrl?: string | null;
    contactInfo?: string;
    displayOrder?: number;
  };

  db.leaders[idx] = {
    ...existing,
    fullName: fullName !== undefined ? fullName.trim() : existing.fullName,
    position: position !== undefined ? position.trim() : existing.position,
    bio: bio !== undefined ? bio.trim() : existing.bio,
    photoUrl: photoUrl !== undefined ? photoUrl : existing.photoUrl,
    contactInfo: contactInfo !== undefined ? contactInfo.trim() : existing.contactInfo,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  res.json(db.leaders[idx]);
});

app.delete('/api/leaders/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.leaders.length;
  db.leaders = db.leaders.filter((l) => l.id !== req.params.id);
  if (db.leaders.length === before) {
    res.status(404).json({ error: 'Leader profile not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- PROGRAMMES ----------
app.get('/api/programmes', async (_req, res) => {
  const db = await readDb();
  res.json([...db.programmes].sort((a, b) => a.displayOrder - b.displayOrder));
});

app.post('/api/programmes', requireAuth(), async (req, res) => {
  const { title, schedule, description, details, theme, imageUrl, isFeatured, displayOrder } =
    req.body as {
      title?: string;
      schedule?: string;
      description?: string;
      details?: string;
      theme?: ProgrammeTheme;
      imageUrl?: string | null;
      isFeatured?: boolean;
      displayOrder?: number;
    };

  if (!title?.trim() || !schedule?.trim()) {
    res.status(400).json({ error: 'Programme title and schedule are required.' });
    return;
  }

  const db = await readDb();
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const programme = {
    id: generateId('prog'),
    title: title.trim(),
    slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
    schedule: schedule.trim(),
    description: (description || '').trim(),
    details: (details || '').trim(),
    theme: (theme === 'fiery-red' ? 'fiery-red' : 'electric-blue') as ProgrammeTheme,
    imageUrl: imageUrl || null,
    isFeatured: Boolean(isFeatured),
    displayOrder: typeof displayOrder === 'number' ? displayOrder : db.programmes.length + 1,
    updatedAt: new Date().toISOString(),
  };
  db.programmes.push(programme);
  await writeDb(db);
  res.status(201).json(programme);
});

app.put('/api/programmes/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.programmes.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Programme not found.' });
    return;
  }
  const existing = db.programmes[idx];
  const { title, schedule, description, details, theme, imageUrl, isFeatured, displayOrder } =
    req.body as {
      title?: string;
      schedule?: string;
      description?: string;
      details?: string;
      theme?: ProgrammeTheme;
      imageUrl?: string | null;
      isFeatured?: boolean;
      displayOrder?: number;
    };

  db.programmes[idx] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    schedule: schedule !== undefined ? schedule.trim() : existing.schedule,
    description: description !== undefined ? description.trim() : existing.description,
    details: details !== undefined ? details.trim() : existing.details,
    theme:
      theme !== undefined
        ? ((theme === 'fiery-red' ? 'fiery-red' : 'electric-blue') as ProgrammeTheme)
        : existing.theme,
    imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : existing.displayOrder,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  res.json(db.programmes[idx]);
});

app.delete('/api/programmes/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.programmes.length;
  db.programmes = db.programmes.filter((p) => p.id !== req.params.id);
  if (db.programmes.length === before) {
    res.status(404).json({ error: 'Programme not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- TRIBES & REGISTRATIONS ----------
app.get('/api/tribes', async (_req, res) => {
  const db = await readDb();
  res.json([...db.tribes].sort((a, b) => a.order - b.order));
});

app.put('/api/tribes/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.tribes.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Tribe not found.' });
    return;
  }
  const existing = db.tribes[idx];
  const { headName, headPhotoUrl, introduction, phone, whatsapp } = req.body as {
    headName?: string;
    headPhotoUrl?: string | null;
    introduction?: string;
    phone?: string;
    whatsapp?: string;
  };

  db.tribes[idx] = {
    ...existing,
    headName: headName !== undefined ? headName.trim() : existing.headName,
    headPhotoUrl: headPhotoUrl !== undefined ? headPhotoUrl : existing.headPhotoUrl,
    introduction: introduction !== undefined ? introduction.trim() : existing.introduction,
    phone: phone !== undefined ? phone.trim() : existing.phone,
    whatsapp: whatsapp !== undefined ? whatsapp.trim() : existing.whatsapp,
    updatedAt: new Date().toISOString(),
  };
  await writeDb(db);
  res.json(db.tribes[idx]);
});

app.post('/api/tribes/register', async (req, res) => {
  const { tribeId, fullName, phone, email, additionalInfo } = req.body as {
    tribeId?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    additionalInfo?: string;
  };

  if (!tribeId || !fullName?.trim() || !phone?.trim() || !email?.trim()) {
    res.status(400).json({
      error: 'Full name, phone number, email address, and selected tribe are required.',
    });
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  const db = await readDb();
  const tribe = db.tribes.find(
    (t) => t.id === tribeId || t.name.toLowerCase() === tribeId.toLowerCase()
  );
  if (!tribe) {
    res.status(400).json({ error: 'Selected tribe was not found.' });
    return;
  }

  const registration = {
    id: generateId('reg'),
    tribeId: tribe.id,
    tribeName: tribe.name,
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    additionalInfo: (additionalInfo || '').trim(),
    status: 'pending' as RegistrationStatus,
    createdAt: new Date().toISOString(),
  };

  db.registrations.unshift(registration);
  await writeDb(db);
  res.status(201).json(registration);
});

app.get('/api/tribes/registrations', requireAuth(), async (req, res) => {
  const db = await readDb();
  const tribeFilter = req.query.tribeId as string | undefined;
  let list = [...db.registrations];
  if (tribeFilter && tribeFilter !== 'all') {
    list = list.filter((r) => r.tribeId === tribeFilter);
  }
  res.json(list);
});

app.patch('/api/tribes/registrations/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.registrations.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Registration not found.' });
    return;
  }
  const { status } = req.body as { status?: RegistrationStatus };
  if (status && ['pending', 'contacted', 'welcomed'].includes(status)) {
    db.registrations[idx].status = status;
  }
  await writeDb(db);
  res.json(db.registrations[idx]);
});

app.delete('/api/tribes/registrations/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.registrations.length;
  db.registrations = db.registrations.filter((r) => r.id !== req.params.id);
  if (db.registrations.length === before) {
    res.status(404).json({ error: 'Registration not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- GALLERY ----------
app.get('/api/gallery', async (_req, res) => {
  const db = await readDb();
  res.json({
    albums: db.albums,
    photos: [...db.photos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  });
});

app.post('/api/gallery/albums', requireAuth(), async (req, res) => {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: 'Album name is required.' });
    return;
  }
  const db = await readDb();
  if (db.albums.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) {
    res.status(409).json({ error: 'An album with this name already exists.' });
    return;
  }
  const album = {
    id: generateId('album'),
    name: name.trim(),
    description: (description || '').trim(),
    createdAt: new Date().toISOString(),
  };
  db.albums.push(album);
  await writeDb(db);
  res.status(201).json(album);
});

app.delete('/api/gallery/albums/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.albums.length;
  db.albums = db.albums.filter((a) => a.id !== req.params.id);
  if (db.albums.length === before) {
    res.status(404).json({ error: 'Album not found.' });
    return;
  }
  db.photos = db.photos.filter((p) => p.albumId !== req.params.id);
  await writeDb(db);
  res.json({ ok: true });
});

app.post('/api/gallery/photos', requireAuth(), async (req, res) => {
  const { albumId, title, caption, imageUrl } = req.body as {
    albumId?: string;
    title?: string;
    caption?: string;
    imageUrl?: string;
  };
  if (!albumId || !title?.trim() || !imageUrl?.trim()) {
    res.status(400).json({ error: 'Album, title, and image are required.' });
    return;
  }
  const db = await readDb();
  if (!db.albums.some((a) => a.id === albumId)) {
    res.status(400).json({ error: 'Selected album does not exist.' });
    return;
  }
  const photo = {
    id: generateId('photo'),
    albumId,
    title: title.trim(),
    caption: (caption || '').trim(),
    imageUrl: imageUrl.trim(),
    createdAt: new Date().toISOString(),
  };
  db.photos.unshift(photo);
  await writeDb(db);
  res.status(201).json(photo);
});

app.delete('/api/gallery/photos/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.photos.length;
  db.photos = db.photos.filter((p) => p.id !== req.params.id);
  if (db.photos.length === before) {
    res.status(404).json({ error: 'Photo not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- CONTACT ----------
app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, message } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Full name, email, and message are required.' });
    return;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  const db = await readDb();
  const entry = {
    id: generateId('msg'),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    message: message.trim(),
    status: 'unread' as ContactStatus,
    createdAt: new Date().toISOString(),
  };
  db.contactMessages.unshift(entry);
  await writeDb(db);
  res.status(201).json(entry);
});

app.get('/api/contact', requireAuth(), async (_req, res) => {
  const db = await readDb();
  res.json(db.contactMessages);
});

app.patch('/api/contact/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const idx = db.contactMessages.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }
  const { status } = req.body as { status?: ContactStatus };
  if (status && ['unread', 'read', 'resolved'].includes(status)) {
    db.contactMessages[idx].status = status;
  }
  await writeDb(db);
  res.json(db.contactMessages[idx]);
});

app.delete('/api/contact/:id', requireAuth(), async (req, res) => {
  const db = await readDb();
  const before = db.contactMessages.length;
  db.contactMessages = db.contactMessages.filter((m) => m.id !== req.params.id);
  if (db.contactMessages.length === before) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }
  await writeDb(db);
  res.json({ ok: true });
});

// ---------- SETTINGS & ADMIN USERS (SUPER ADMIN) ----------
app.put('/api/settings', requireAuth(['super_admin']), async (req, res) => {
  const db = await readDb();
  const allowed = req.body as Partial<typeof db.settings>;
  db.settings = {
    ...db.settings,
    ...allowed,
  };
  await writeDb(db);
  res.json(db.settings);
});

app.get('/api/admin/users', requireAuth(['super_admin']), async (_req, res) => {
  const db = await readDb();
  res.json(db.users.map(toSafeUser));
});

app.post('/api/admin/users', requireAuth(['super_admin']), async (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
  };
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    res.status(400).json({
      error: 'Name, email, and a password of at least 8 characters are required.',
    });
    return;
  }
  const db = await readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    res.status(409).json({ error: 'An administrator with that email already exists.' });
    return;
  }
  const newUser = {
    id: generateId('admin'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: (role === 'super_admin' ? 'super_admin' : 'editor') as AdminRole,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  await writeDb(db);
  res.status(201).json(toSafeUser(newUser));
});

app.delete(
  '/api/admin/users/:id',
  requireAuth(['super_admin']),
  async (req: AuthenticatedRequest, res) => {
    if (req.adminUser?.userId === req.params.id) {
      res.status(400).json({ error: 'You cannot delete your own active account.' });
      return;
    }
    const db = await readDb();
    db.users = db.users.filter((u) => u.id !== req.params.id);
    await writeDb(db);
    res.json({ ok: true });
  }
);
