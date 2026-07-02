import React, { useState, useRef } from 'react';
import { PhotoIcon, LinkIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Spinner from './Spinner';
import api from '../../services/api';

const ImagePicker = ({ value, onChange, label, className = '' }) => {
  const [mode, setMode] = useState(value && !value.startsWith('blob') ? 'url' : 'url');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG, WEBP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max file size is 5MB'); return; }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = Array.isArray(res.data?.data) ? res.data.data[0] : null;
      if (uploaded?.url) onChange(uploaded.url);
      else setError('Upload failed no URL returned');
    } catch {
      setError('Upload failed. Check Cloudinary settings in backend .env');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={className}>
      {label && <label className="label-text">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 mb-3">
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${mode === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <LinkIcon className="w-3.5 h-3.5" /> Paste URL
        </button>
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${mode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <ArrowUpTrayIcon className="w-3.5 h-3.5" /> Upload File
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input-field w-full"
        />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all select-none"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Spinner size="sm" /> <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <>
              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Click or drag & drop</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP · max 5 MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="mt-3 inline-flex items-start gap-2">
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="h-20 w-auto max-w-[160px] rounded-lg border border-gray-200 object-cover shadow-sm"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
