import React, { useState, useRef } from 'react';
import { Upload, FileImage, FileAudio, X, Loader2 } from 'lucide-react';
import { uploadFile } from '../../api/files';
import { formatFileSize } from '../../utils/formatters';

export const FileUpload = ({ onUploadSuccess, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setFileMeta(null);

    try {
      // Perform upload
      const meta = await uploadFile(file);
      setFileMeta(meta);
      if (onUploadSuccess) {
        onUploadSuccess(meta);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      const msg = err.response?.data?.detail || err.message || 'File upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setFileMeta(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 w-full ${className}`}>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
        Attach Sighting Media (Images/Audio)
      </label>
      
      {!fileMeta && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-forest-800 hover:border-emerald-500 hover:dark:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-forest-900"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,audio/*"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center space-y-2 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium">Uploading media to secure storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1 text-slate-500 dark:text-slate-400">
              <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-1" />
              <span className="text-xs font-medium">
                Click to browse images or audio records
              </span>
              <span className="text-[10px] text-slate-400">
                Supports JPG, PNG, WEBP, MP3, WAV, OGG up to 10MB
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}

      {fileMeta && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-forest-950/40 border border-slate-200 dark:border-forest-800 rounded-xl relative">
          {fileMeta.file_type === 'image' ? (
            <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-slate-100 flex-shrink-0" style={{ backgroundImage: `url(${fileMeta.file_url})` }} />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-forest-850 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
              <FileAudio className="w-6 h-6" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {fileMeta.file_name}
            </p>
            <p className="text-[10px] text-slate-400">
              {formatFileSize(fileMeta.file_size)} • {fileMeta.mime_type}
            </p>
          </div>

          <button
            type="button"
            onClick={clearUpload}
            className="text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-forest-850 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
export default FileUpload;
