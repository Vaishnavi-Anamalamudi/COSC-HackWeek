export function createStringHelpers() {
  return {
    substring(value, start, end) {
      return String(value).substring(Number(start), end === undefined ? undefined : Number(end));
    },
    upper(value) {
      return String(value).toUpperCase();
    },
    lowercase(value) {
      return String(value).toLowerCase();
    }
  };
}
