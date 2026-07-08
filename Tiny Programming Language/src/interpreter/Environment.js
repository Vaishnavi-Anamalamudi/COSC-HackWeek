import { NovaRuntimeError } from './Errors.js';

export class Environment {
  constructor(parent = null, name = 'scope') {
    this.parent = parent;
    this.name = name;
    this.values = new Map();
  }

  define(name, value) {
    this.values.set(name, value);
    return value;
  }

  assign(name, value, token = {}) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return value;
    }
    if (this.parent) return this.parent.assign(name, value, token);
    throw new NovaRuntimeError(`Undefined variable '${name}'.`, token.line, token.column, `Declare it first with let ${name} = ...`);
  }

  get(name, token = {}) {
    if (this.values.has(name)) return this.values.get(name);
    if (this.parent) return this.parent.get(name, token);
    throw new NovaRuntimeError(`Undefined variable '${name}'.`, token.line, token.column, `Check the spelling or declare ${name}.`);
  }

  snapshot() {
    const current = {};
    for (const [key, value] of this.values.entries()) {
      current[key] = sanitizeValue(value);
    }
    return {
      name: this.name,
      values: current,
      parent: this.parent?.snapshot() ?? null
    };
  }
}

export function sanitizeValue(value) {
  if (typeof value === 'function') return '[native function]';
  if (value?.type === 'NovaFunction') return `[function ${value.name}]`;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
  return value;
}
