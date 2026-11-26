import React, { useState } from 'react';
import { Upload, FolderPlus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useSiteData } from '../../context/SiteDataContext';
import { useToast } from '../../context/ToastContext';

export function AdminGalleryPanel() {
  const { data, mutate } = useSiteData();
  const { showToast } = useToast();
  const albums = data?.albums ?? [];
  const photos = data?.photos ?? [];

  const [albumName, setAlbumName] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  const [selectedAlbumId, setSelectedAlbumId] = useState(albums[0]?.id || '');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    setCreatingAlbum(true);
    try {
      const created = await api.createAlbum(albumName.trim(), albumDesc.trim());
      setAlbumName('');
      setAlbumDesc('');
      setSelectedAlbumId(created.id);
      mutate((prev) => ({ ...prev, albums: [...prev.albums, created] }));
      showToast(`Album "${created.name}" created.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create album.', 'error');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      setPhotoUrl(res.url);
      if (!photoTitle) {
        setPhotoTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
      }
      showToast('Image uploaded. Click "Add to Gallery" to publish.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAlbum = selectedAlbumId || albums[0]?.id;
    if (!targetAlbum || !photoTitle.trim() || !photoUrl) {
      showToast('Please select an album, upload an image, and enter a title.', 'error');
      return;
    }
    setSavingPhoto(true);
    try {
      const created = await api.createPhoto({
        albumId: targetAlbum,
        title: photoTitle.trim(),
        caption: photoCaption.trim(),
        imageUrl: photoUrl,
      });
      setPhotoTitle('');
      setPhotoCaption('');
      setPhotoUrl('');
      mutate((prev) => ({ ...prev, photos: [created, ...prev.photos] }));
      showToast('Photograph published to gallery.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add photo.', 'error');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Delete this photograph from the gallery?')) return;
    try {
      await api.deletePhoto(id);
      mutate((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));
      showToast('Photo deleted.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Gallery Management</h2>
        <p className="text-sm text-[#A3A3A3]/75">
          Upload photographs, organize albums, and manage Chapel of Glory visual memories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Photo Form */}
        <form
          onSubmit={handleAddPhoto}
          className="lg:col-span-7 rounded-none border border-white/25 bg-[#0A0A0A] p-6 space-y-4"
        >
          <h3 className="font-display text-lg font-bold text-white">Upload New Photograph</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Album
              </label>
              <select
                value={selectedAlbumId || albums[0]?.id || ''}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="e.g. Sunday Worship Moment"
                className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="Short description of this moment"
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 rounded-none border border-dashed border-white/45 bg-[#050505] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{photoUrl ? 'Replace Image File' : 'Choose Image File'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Upload preview"
                className="h-12 w-16 rounded-none object-cover border border-white/20"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={savingPhoto || !photoUrl}
            className="inline-flex items-center gap-2 rounded-none bg-white text-[#050505] px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
          >
            {savingPhoto && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to Gallery
          </button>
        </form>

        {/* Create Album Form */}
        <form
          onSubmit={handleCreateAlbum}
          className="lg:col-span-5 rounded-none border border-white/15 bg-[#0A0A0A]/70 p-6 space-y-4"
        >
          <h3 className="font-display text-lg font-bold text-white">Create New Album</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Album Name *
            </label>
            <input
              type="text"
              required
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="e.g. Campus Outreach 2026"
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]/80 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={albumDesc}
              onChange={(e) => setAlbumDesc(e.target.value)}
              placeholder="Short album description"
              className="w-full rounded-none border border-white/15 bg-[#050505] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={creatingAlbum}
            className="inline-flex items-center gap-2 rounded-none border border-white/40 bg-white/10 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-[#050505] transition-colors cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            Create Album
          </button>
        </form>
      </div>

      {/* Photos List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const album = albums.find((a) => a.id === photo.albumId);
          return (
            <div
              key={photo.id}
              className="overflow-hidden rounded-none border border-white/10 bg-[#0A0A0A]/70 flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#050505]">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    {album?.name || 'Album'}
                  </span>
                  <p className="text-sm font-semibold text-white truncate">{photo.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-none border border-red-400/25 bg-red-500/10 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
