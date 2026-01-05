export function jobIdFromKey(key: string): string {
  const file = key.split("/").pop()!;
  return file.split(".").slice(0, -1).join(".");
}
