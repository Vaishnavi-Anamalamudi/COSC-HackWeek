import { createMathBuiltins } from './Math.js';
import { createPrintBuiltin } from './Print.js';

export function createBuiltins({ write = () => {}, read = async () => '' } = {}) {
  return {
    print: createPrintBuiltin(write),
    input: {
      name: 'input',
      arity: -1,
      async call(args) {
        return read(args[0] ? String(args[0]) : '');
      }
    },
    len: {
      name: 'len',
      arity: 1,
      call(args) {
        const value = args[0];
        if (value === null || value === undefined) return 0;
        if (Array.isArray(value) || typeof value === 'string') return value.length;
        return String(value).length;
      }
    },
    time: {
      name: 'time',
      arity: 0,
      call() {
        return Date.now();
      }
    },
    sleep: {
      name: 'sleep',
      arity: 1,
      async call(args) {
        const ms = Math.max(0, Number(args[0] ?? 0));
        await new Promise((resolve) => setTimeout(resolve, ms));
        return null;
      }
    },
    ...createMathBuiltins()
  };
}
