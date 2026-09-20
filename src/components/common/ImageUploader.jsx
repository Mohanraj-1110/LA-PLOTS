import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ImagePlus, X, Star, Loader2, AlertCircle } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 8;
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.78;

/**
 * Compress an image File to a JPEG base64 data URL using the Canvas API.
 * Resizes so the longest side is at most MAX_DIMENSION px.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = objectUrl;
  });
}

/**
 * ImageUploader — reusable multi-image upload component.
 *
 * Props:
 *   images          string[]   Current image list (base64 data URLs or https:// URLs)
 *   onChange        fn         Called with updated images array
 *   primaryImage    string     The currently designated primary image
 *   onPrimaryChange fn         Called with new primary image URL
 *   maxFiles        number     Maximum allowed images (default 8)
 *   label           string     Display label for the drop zone
 */
export function ImageUploader({
  images = [],
  onChange,
  primaryImage = '',
  onPrimaryChange,
  maxFiles = MAX_FILES,
  label = 'Photos',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);

  const processFiles = useCallback(
    async (fileList) => {
      setErrors([]);
      const newErrors = [];
      const validFiles = [];

      for (const file of fileList) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newErrors.push(`"${file.name}" must be JPG, PNG, or WEBP.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          newErrors.push(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
          continue;
        }
        validFiles.push(file);
      }

      const slots = maxFiles - images.length;
      if (validFiles.length > slots) {
        newErrors.push(
          `Only ${slots} more image${slots !== 1 ? 's' : ''} can be added (maximum ${maxFiles}).`
        );
        validFiles.splice(slots);
      }

      if (validFiles.length === 0) {
        setErrors(newErrors);
        return;
      }

      setUploading(true);
      try {
        const compressed = await Promise.all(validFiles.map(compressImage));
        const updated = [...images, ...compressed];
        onChange(updated);
        if (!primaryImage && compressed.length > 0) {
          onPrimaryChange(compressed[0]);
        }
      } catch (err) {
        newErrors.push(err.message || 'Failed to process one or more images.');
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
        if (newErrors.length > 0) setErrors(newErrors);
      }
    },
    [images, onChange, primaryImage, onPrimaryChange, maxFiles]
  );

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) processFiles(files);
  };

  const handleRemove = (idx) => {
    const removed = images[idx];
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
    if (removed === primaryImage) {
      onPrimaryChange(updated[0] || '');
    }
  };

  const canAdd = images.length < maxFiles && !uploading;

  return (
    <div className="space-y-4">
      {/* Drop Zone — only shown when more images can be added */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-9 px-6 cursor-pointer transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-200 bg-slate-50/60 hover:border-primary-300 hover:bg-primary-50/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Compressing images…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {dragOver ? 'Drop to upload' : `Click or drag & drop ${label}`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  JPG · PNG · WEBP &nbsp;·&nbsp; Max {MAX_FILE_SIZE_MB}MB each &nbsp;·&nbsp; Up to {maxFiles} images
                </p>
              </div>
            </div>
          )}
          {images.length > 0 && (
            <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-400 tabular-nums">
              {images.length} / {maxFiles}
            </span>
          )}
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {errors.map((msg, i) => (
              <li key={i} className="text-xs text-red-600">{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((src, idx) => {
            const isPrimary = src === primaryImage;
            return (
              <div
                key={idx}
                className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${
                  isPrimary
                    ? 'border-amber-400 shadow-lg shadow-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Square thumbnail */}
                <div className="aspect-square bg-slate-100">
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Primary badge */}
                {isPrimary && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    Primary
                  </div>
                )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-150">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => onPrimaryChange(src)}
                      title="Set as primary"
                      className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-500 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove photo"
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Inline "add more" tile when grid is visible and limit not reached */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-slate-400 hover:text-primary-500"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ImageUploader.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  primaryImage: PropTypes.string,
  onPrimaryChange: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  label: PropTypes.string,
};

export default ImageUploader;
