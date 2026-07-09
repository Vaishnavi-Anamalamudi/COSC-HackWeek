export function formatNovaValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return `[${value.map(formatNovaValue).join(', ')}]`;
  return String(value);
}

export function createPrintBuiltin(write) {
  return {
    name: 'print',
    arity: -1,
    async call(args) {
      write(args.map(formatNovaValue).join(' '));
      return null;
    }
  };
}
