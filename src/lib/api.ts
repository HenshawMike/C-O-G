import type {
  SiteData,
  SafeAdminUser,
  Leader,
  Programme,
  Tribe,
  TribeRegistration,
  GalleryAlbum,
  GalleryPhoto,
  ContactMessage,
  SiteSettings,
  RegistrationStatus,
  ContactStatus,
  AdminRole,
  Announcement,
} from '../types';

const TOKEN_KEY = 'cog_admin_token';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/uploads/') && API_BASE_URL) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Public site bootstrap
  getSite: () => request<SiteData>('/api/site'),

  // Auth
  me: () => request<{ user: SafeAdminUser | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: SafeAdminUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  // Upload
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Leaders
  createLeader: (payload: Partial<Leader>) =>
    request<Leader>('/api/leaders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateLeader: (id: string, payload: Partial<Leader>) =>
    request<Leader>(`/api/leaders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteLeader: (id: string) =>
    request<{ ok: boolean }>(`/api/leaders/${id}`, { method: 'DELETE' }),

  // Programmes
  createProgramme: (payload: Partial<Programme>) =>
    request<Programme>('/api/programmes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProgramme: (id: string, payload: Partial<Programme>) =>
    request<Programme>(`/api/programmes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProgramme: (id: string) =>
    request<{ ok: boolean }>(`/api/programmes/${id}`, { method: 'DELETE' }),

  // Tribes & Registrations
  updateTribe: (id: string, payload: Partial<Tribe>) =>
    request<Tribe>(`/api/tribes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  registerTribe: (payload: {
    tribeId: string;
    fullName: string;
    phone: string;
    email: string;
    additionalInfo: string;
  }) =>
    request<TribeRegistration>('/api/tribes/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRegistrations: (tribeId?: string) =>
    request<TribeRegistration[]>(
      `/api/tribes/registrations${tribeId && tribeId !== 'all' ? `?tribeId=${encodeURIComponent(tribeId)}` : ''}`
    ),
  updateRegistrationStatus: (id: string, status: RegistrationStatus) =>
    request<TribeRegistration>(`/api/tribes/registrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteRegistration: (id: string) =>
    request<{ ok: boolean }>(`/api/tribes/registrations/${id}`, { method: 'DELETE' }),

  // Gallery
  createAlbum: (name: string, description: string) =>
    request<GalleryAlbum>('/api/gallery/albums', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  deleteAlbum: (id: string) =>
    request<{ ok: boolean }>(`/api/gallery/albums/${id}`, { method: 'DELETE' }),
  createPhoto: (payload: {
    albumId: string;
    title: string;
    caption: string;
    imageUrl: string;
  }) =>
    request<GalleryPhoto>('/api/gallery/photos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deletePhoto: (id: string) =>
    request<{ ok: boolean }>(`/api/gallery/photos/${id}`, { method: 'DELETE' }),

  // Contact
  submitContact: (payload: {
    fullName: string;
    email: string;
    phone: string;
    message: string;
  }) =>
    request<ContactMessage>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getContactMessages: () => request<ContactMessage[]>('/api/contact'),
  updateContactStatus: (id: string, status: ContactStatus) =>
    request<ContactMessage>(`/api/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteContactMessage: (id: string) =>
    request<{ ok: boolean }>(`/api/contact/${id}`, { method: 'DELETE' }),

  // Announcements
  createAnnouncement: (payload: Partial<Announcement>) =>
    request<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAnnouncement: (id: string, payload: Partial<Announcement>) =>
    request<Announcement>(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAnnouncement: (id: string) =>
    request<{ ok: boolean }>(`/api/announcements/${id}`, { method: 'DELETE' }),

  // Settings & Admin Users
  updateSettings: (payload: Partial<SiteSettings>) =>
    request<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getAdminUsers: () => request<SafeAdminUser[]>('/api/admin/users'),
  createAdminUser: (payload: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
  }) =>
    request<SafeAdminUser>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteAdminUser: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
};
