export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

export const isImageFile = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

export const isAudioFile = (mimeType) => {
  return mimeType && mimeType.startsWith('audio/');
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'inactive':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    case 'maintenance':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'planned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'completed':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
};
export default {
  getFileExtension,
  isImageFile,
  isAudioFile,
  getStatusColor
};
