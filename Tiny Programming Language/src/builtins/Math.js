export function createMathBuiltins() {
  return {
    random: {
      name: 'random',
      arity: -1,
      call(args) {
        if (args.length === 2) {
          const [min, max] = args.map(Number);
          return Math.random() * (max - min) + min;
        }
        return Math.random();
      }
    },
    sqrt: {
      name: 'sqrt',
      arity: 1,
      call(args) {
        return Math.sqrt(Number(args[0]));
      }
    },
    abs: {
      name: 'abs',
      arity: 1,
      call(args) {
        return Math.abs(Number(args[0]));
      }
    },
    min: {
      name: 'min',
      arity: -1,
      call(args) {
        return Math.min(...args.map(Number));
      }
    },
    max: {
      name: 'max',
      arity: -1,
      call(args) {
        return Math.max(...args.map(Number));
      }
    }
  };
}
