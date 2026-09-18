import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, File, AlertCircle, Trash2 } from 'lucide-react';

export function FileUploadZone({
  onFileSelect,
  selectedFile,
  onFileRemove,
  acceptedFormats = ['pdf', 'jpg', 'jpeg', 'png'],
  maxSizeMb = 10,
  label = 'Upload Property Document or Photo',
  sublabel = 'PDF, PNG, JPG up to 10MB',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = (file) => {
    setError('');
    if (!file) return;

    // Check size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
      return;
    }

    // Check extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(ext)) {
      setError(`Unsupported file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    onFileSelect({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      file,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-bold text-slate-700">{label}</label>}

      {selectedFile ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-emerald-700 font-medium">{selectedFile.size}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            aria-label="Remove uploaded file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptedFormats.map((ext) => `.${ext}`).join(',')}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFiles(e.target.files[0]);
              }
            }}
          />
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-800 mb-0.5">Click or drag & drop to upload</p>
          <p className="text-[11px] text-slate-400">{sublabel}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-600 text-xs mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

FileUploadZone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  selectedFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.string,
    type: PropTypes.string,
  }),
  onFileRemove: PropTypes.func,
  acceptedFormats: PropTypes.arrayOf(PropTypes.string),
  maxSizeMb: PropTypes.number,
  label: PropTypes.string,
  sublabel: PropTypes.string,
};
