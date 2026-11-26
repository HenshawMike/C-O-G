export type AdminRole = 'super_admin' | 'editor';

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

export interface Leader {
  id: string;
  fullName: string;
  position: string;
  bio: string;
  photoUrl: string | null;
  contactInfo: string;
  displayOrder: number;
  updatedAt: string;
}

export type ProgrammeTheme = 'electric-blue' | 'fiery-red';

export interface Programme {
  id: string;
  title: string;
  slug: string;
  schedule: string;
  description: string;
  details: string;
  theme: ProgrammeTheme;
  imageUrl: string | null;
  isFeatured: boolean;
  displayOrder: number;
  updatedAt: string;
}

export interface Tribe {
  id: string;
  name: string;
  order: number;
  headName: string;
  headPhotoUrl: string | null;
  introduction: string;
  phone: string;
  whatsapp: string;
  updatedAt: string;
}

export type RegistrationStatus = 'pending' | 'contacted' | 'welcomed';

export interface TribeRegistration {
  id: string;
  tribeId: string;
  tribeName: string;
  fullName: string;
  phone: string;
  email: string;
  additionalInfo: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  albumId: string;
  title: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
}

export type ContactStatus = 'unread' | 'read' | 'resolved';

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export interface SiteSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialHandle: string;
  instagramUrl: string;
  telegramUrl: string;
}

export type AnnouncementPlacement =
  | 'hero-card'
  | 'top-banner'
  | 'programmes-page'
  | 'tribes-page';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  badge: string;
  placement: AnnouncementPlacement;
  linkLabel: string;
  linkTo: string;
  active: boolean;
  updatedAt: string;
}

export interface SiteData {
  settings: SiteSettings;
  leaders: Leader[];
  programmes: Programme[];
  tribes: Tribe[];
  albums: GalleryAlbum[];
  photos: GalleryPhoto[];
  announcements: Announcement[];
}
