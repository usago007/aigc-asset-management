let counter = 0;

export function generateUUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const increment = (++counter).toString(36).padStart(4, '0');
  return `${timestamp}-${randomPart}-${increment}`;
}
