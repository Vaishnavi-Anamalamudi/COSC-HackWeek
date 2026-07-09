import { Lexer } from '../lexer/Lexer.js';
import { Parser } from '../parser/Parser.js';
import { createBuiltins } from '../builtins/index.js';
import { BreakSignal, ContinueSignal, NovaError, NovaRuntimeError, ReturnSignal } from './Errors.js';
import { Environment, sanitizeValue } from './Environment.js';

const MAX_STEPS = 20000;

export class NovaFunction {
  constructor(declaration, closure) {
    this.type = 'NovaFunction';
    this.name = declaration.name;
    this.params = declaration.params;
    this.body = declaration.body;
    this.closure = closure;
  }

  async call(interpreter, args, token) {
    if (args.length !== this.params.length) {
      throw new NovaRuntimeError(
        `Function '${this.name}' expected ${this.params.length} arguments but got ${args.length}.`,
        token.line,
        token.column,
        'Pass the same number of values as declared parameters.'
      );
    }

    const environment = new Environment(this.closure, `function ${this.name}`);
    this.params.forEach((param, index) => environment.define(param, args[index]));

    try {
      await interpreter.executeBlock(this.body, environment);
    } catch (signal) {
      if (signal instanceof ReturnSignal) return signal.value;
      throw signal;
    }
    return null;
  }
}

export class Interpreter {
  constructor(options = {}) {
    this.output = [];
    this.errors = [];
    this.timeline = [];
    this.callStack = [];
    this.breakpoints = new Set(options.breakpoints || []);
    this.stepLimit = options.stepLimit || MAX_STEPS;
    this.stepCount = 0;
    this.onStep = options.onStep || null;
    this.input = options.input || (async (promptText) => globalThis.prompt?.(promptText) ?? '');
    this.global = new Environment(null, 'global');
    this.environment = this.global;

    const builtins = createBuiltins({
      write: (line) => this.output.push(line),
      read: this.input
    });
    for (const [name, builtin] of Object.entries(builtins)) {
      this.global.define(name, builtin);
    }
  }

  async interpret(program) {
    try {
      await this.executeBlock(program, this.global, false);
      return this.result(program);
    } catch (error) {
      const diagnostic = error instanceof NovaError
        ? error.toDiagnostic()
        : new NovaRuntimeError(error.message || 'Unknown runtime error.', 1, 1, 'Review the program flow.').toDiagnostic();
      this.errors.push(diagnostic);
      return this.result(program);
    }
  }

  result(program) {
    return {
      ok: this.errors.length === 0,
      output: this.output,
      errors: this.errors,
      timeline: this.timeline,
      memory: this.global.snapshot(),
      ast: program
    };
  }

  async executeBlock(block, environment = new Environment(this.environment), scoped = true) {
    const previous = this.environment;
    if (scoped) this.environment = environment;
    try {
      for (const statement of block.body) {
        await this.execute(statement);
      }
    } finally {
      if (scoped) this.environment = previous;
    }
  }

  async execute(statement) {
    this.recordStep(statement);

    switch (statement.type) {
      case 'Program':
      case 'BlockStatement':
        return this.executeBlock(statement, new Environment(this.environment, 'block'));
      case 'LetDeclaration':
        return this.environment.define(statement.name, await this.evaluate(statement.initializer));
      case 'FunctionDeclaration':
        return this.environment.define(statement.name, new NovaFunction(statement, this.environment));
      case 'ImportDeclaration':
        this.timeline.push({ type: 'module', line: statement.line, detail: `Registered import ${statement.source}` });
        return null;
      case 'ExpressionStatement':
        return this.evaluate(statement.expression);
      case 'IfStatement':
        return this.executeIf(statement);
      case 'WhileStatement':
        return this.executeWhile(statement);
      case 'ForStatement':
        return this.executeFor(statement);
      case 'RepeatStatement':
        return this.executeRepeat(statement);
      case 'ReturnStatement':
        throw new ReturnSignal(await this.evaluate(statement.value));
      case 'BreakStatement':
        throw new BreakSignal();
      case 'ContinueStatement':
        throw new ContinueSignal();
      default:
        throw new NovaRuntimeError(`Unknown statement '${statement.type}'.`, statement.line, statement.column, 'This may be an interpreter bug.');
    }
  }

  async executeIf(statement) {
    if (this.isTruthy(await this.evaluate(statement.test))) return this.execute(statement.consequent);
    if (statement.alternate) return this.execute(statement.alternate);
    return null;
  }

  async executeWhile(statement) {
    while (this.isTruthy(await this.evaluate(statement.test))) {
      try {
        await this.execute(statement.body);
      } catch (signal) {
        if (signal instanceof BreakSignal) break;
        if (signal instanceof ContinueSignal) continue;
        throw signal;
      }
    }
    return null;
  }

  async executeFor(statement) {
    const environment = new Environment(this.environment, 'for');
    const previous = this.environment;
    this.environment = environment;

    try {
      if (statement.initializer) await this.execute(statement.initializer);
      while (this.isTruthy(await this.evaluate(statement.test))) {
        try {
          await this.execute(statement.body);
        } catch (signal) {
          if (signal instanceof BreakSignal) break;
          if (!(signal instanceof ContinueSignal)) throw signal;
        }
        if (statement.update) await this.evaluate(statement.update);
      }
    } finally {
      this.environment = previous;
    }
    return null;
  }

  async executeRepeat(statement) {
    const count = Math.floor(Number(await this.evaluate(statement.count)));
    if (!Number.isFinite(count) || count < 0) {
      throw new NovaRuntimeError('repeat expects a non-negative number.', statement.line, statement.column, 'Use repeat 5 { ... }.');
    }

    for (let index = 0; index < count; index += 1) {
      try {
        await this.execute(statement.body);
      } catch (signal) {
        if (signal instanceof BreakSignal) break;
        if (signal instanceof ContinueSignal) continue;
        throw signal;
      }
    }
    return null;
  }

  async evaluate(expression) {
    this.recordStep(expression);

    switch (expression.type) {
      case 'Literal':
        return expression.value;
      case 'Identifier':
        return this.environment.get(expression.name, expression);
      case 'GroupingExpression':
        return this.evaluate(expression.expression);
      case 'ArrayExpression':
        return Promise.all(expression.elements.map((element) => this.evaluate(element)));
      case 'UnaryExpression':
        return this.evaluateUnary(expression);
      case 'BinaryExpression':
        return this.evaluateBinary(expression);
      case 'LogicalExpression':
        return this.evaluateLogical(expression);
      case 'AssignmentExpression':
        return this.evaluateAssignment(expression);
      case 'CallExpression':
        return this.evaluateCall(expression);
      case 'IndexExpression':
        return this.evaluateIndex(expression);
      case 'MemberExpression':
        return this.evaluateMember(expression);
      default:
        throw new NovaRuntimeError(`Unknown expression '${expression.type}'.`, expression.line, expression.column, 'This may be an interpreter bug.');
    }
  }

  async evaluateUnary(expression) {
    const value = await this.evaluate(expression.argument);
    if (expression.operator === '!') return !this.isTruthy(value);
    if (expression.operator === '-') return -Number(value);
    return null;
  }

  async evaluateBinary(expression) {
    const left = await this.evaluate(expression.left);
    const right = await this.evaluate(expression.right);

    switch (expression.operator) {
      case '+':
        return typeof left === 'string' || typeof right === 'string' ? `${left}${right}` : Number(left) + Number(right);
      case '-':
        return Number(left) - Number(right);
      case '*':
        return Number(left) * Number(right);
      case '/':
        if (Number(right) === 0) {
          throw new NovaRuntimeError('Division by zero.', expression.line, expression.column, 'Check the denominator before dividing.');
        }
        return Number(left) / Number(right);
      case '%':
        if (Number(right) === 0) {
          throw new NovaRuntimeError('Modulo by zero.', expression.line, expression.column, 'Check the denominator before using %.');
        }
        return Number(left) % Number(right);
      case '==':
        return this.isEqual(left, right);
      case '!=':
        return !this.isEqual(left, right);
      case '>':
        return left > right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
      default:
        throw new NovaRuntimeError(`Unknown operator '${expression.operator}'.`, expression.line, expression.column, 'Use a supported operator.');
    }
  }

  async evaluateLogical(expression) {
    const left = await this.evaluate(expression.left);
    if (expression.operator === '||') return this.isTruthy(left) ? left : this.evaluate(expression.right);
    if (expression.operator === '&&') return this.isTruthy(left) ? this.evaluate(expression.right) : left;
    return null;
  }

  async evaluateAssignment(expression) {
    const value = await this.evaluate(expression.value);
    if (expression.target.type === 'Identifier') {
      return this.environment.assign(expression.target.name, value, expression.target);
    }

    const object = await this.evaluate(expression.target.object);
    const index = await this.evaluate(expression.target.index);
    if (!Array.isArray(object) && typeof object !== 'string') {
      throw new NovaRuntimeError('Index assignment needs an array.', expression.line, expression.column, 'Assign to values like items[0] = value.');
    }
    if (typeof object === 'string') {
      throw new NovaRuntimeError('Strings are immutable.', expression.line, expression.column, 'Build a new string instead of assigning by index.');
    }
    object[this.normalizeIndex(index, object.length, expression.target)] = value;
    return value;
  }

  async evaluateIndex(expression) {
    const object = await this.evaluate(expression.object);
    const index = await this.evaluate(expression.index);
    if (!Array.isArray(object) && typeof object !== 'string') {
      throw new NovaRuntimeError('Only arrays and strings can be indexed.', expression.line, expression.column, 'Use value[index] on an array or string.');
    }
    return object[this.normalizeIndex(index, object.length, expression)] ?? null;
  }

  async evaluateMember(expression) {
    const object = await this.evaluate(expression.object);
    if (expression.property === 'length') {
      if (Array.isArray(object) || typeof object === 'string') return object.length;
      return 0;
    }
    return { __member: true, object, property: expression.property, token: expression };
  }

  async evaluateCall(expression) {
    if (expression.callee.type === 'MemberExpression') {
      const member = await this.evaluateMember(expression.callee);
      const args = await Promise.all(expression.args.map((arg) => this.evaluate(arg)));
      return this.callMember(member.object, member.property, args, expression);
    }

    const callee = await this.evaluate(expression.callee);
    const args = await Promise.all(expression.args.map((arg) => this.evaluate(arg)));

    if (callee instanceof NovaFunction) {
      this.callStack.push(callee.name);
      try {
        return await callee.call(this, args, expression);
      } finally {
        this.callStack.pop();
      }
    }

    if (callee && typeof callee.call === 'function') {
      if (callee.arity >= 0 && args.length !== callee.arity) {
        throw new NovaRuntimeError(
          `Function '${callee.name}' expected ${callee.arity} arguments but got ${args.length}.`,
          expression.line,
          expression.column,
          'Check the function call arguments.'
        );
      }
      return callee.call(args);
    }

    throw new NovaRuntimeError('Can only call functions.', expression.line, expression.column, 'Call a declared function or builtin.');
  }

  callMember(object, property, args, token) {
    if (Array.isArray(object)) {
      if (property === 'push') return object.push(args[0]);
      if (property === 'pop') return object.pop() ?? null;
      if (property === 'length') return object.length;
      if (property === 'index') return object.findIndex((item) => this.isEqual(item, args[0]));
    }

    if (typeof object === 'string') {
      if (property === 'substring') return object.substring(Number(args[0]), args[1] === undefined ? undefined : Number(args[1]));
      if (property === 'upper' || property === 'uppercase') return object.toUpperCase();
      if (property === 'lower' || property === 'lowercase') return object.toLowerCase();
      if (property === 'length') return object.length;
      if (property === 'index') return object.indexOf(String(args[0] ?? ''));
    }

    throw new NovaRuntimeError(`Unknown member '${property}'.`, token.line, token.column, 'Supported members include push, pop, length, index, substring, upper, and lower.');
  }

  normalizeIndex(index, length, token) {
    const numeric = Number(index);
    if (!Number.isInteger(numeric)) {
      throw new NovaRuntimeError('Index must be an integer.', token.line, token.column, 'Use a whole number index.');
    }
    if (numeric < 0 || numeric >= length) {
      throw new NovaRuntimeError('Index out of range.', token.line, token.column, `Use an index from 0 to ${Math.max(0, length - 1)}.`);
    }
    return numeric;
  }

  isTruthy(value) {
    return value !== false && value !== null && value !== undefined && value !== 0 && value !== '';
  }

  isEqual(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  recordStep(node) {
    this.stepCount += 1;
    if (this.stepCount > this.stepLimit) {
      throw new NovaRuntimeError('Execution step limit exceeded.', node.line, node.column, 'Check for an infinite loop.');
    }

    const entry = {
      step: this.stepCount,
      type: node.type,
      line: node.line,
      column: node.column,
      callStack: [...this.callStack],
      memory: sanitizeValue(this.environment.snapshot().values),
      breakpoint: this.breakpoints.has(node.line)
    };
    this.timeline.push(entry);
    this.onStep?.(entry);
  }
}

export async function runNova(source, options = {}) {
  try {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(options);
    const result = await interpreter.interpret(ast);
    return { ...result, tokens };
  } catch (error) {
    const diagnostic = error instanceof NovaError
      ? error.toDiagnostic()
      : new NovaRuntimeError(error.message || 'Unknown error.', 1, 1, 'Review the program.').toDiagnostic();
    return {
      ok: false,
      output: [],
      errors: [diagnostic],
      tokens: [],
      ast: null,
      timeline: [],
      memory: null
    };
  }
}
