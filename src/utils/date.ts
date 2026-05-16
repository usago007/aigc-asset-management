export function formatDate(dateStr: string, format: 'full' | 'date' | 'time' | 'relative' = 'full'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const totalMinutes = Math.floor(diff / 60000);
  const totalHours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (format === 'relative') {
    if (totalMinutes < 1) return '刚刚';
    if (totalMinutes < 60) return `${totalMinutes}分钟前`;
    if (totalHours < 24) return `${totalHours}小时前`;
    if (days < 7) return `${days}天前`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hourStr = String(date.getHours()).padStart(2, '0');
  const minuteStr = String(date.getMinutes()).padStart(2, '0');

  if (format === 'date') return `${year}-${month}-${day}`;
  if (format === 'time') return `${hourStr}:${minuteStr}`;
  return `${year}-${month}-${day} ${hourStr}:${minuteStr}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
