import { TokenType } from '../lexer/Token.js';
import { NovaSyntaxError } from '../interpreter/Errors.js';
import { node } from './AST.js';

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      body.push(this.declaration());
    }
    return node('Program', { body }, this.peek());
  }

  declaration() {
    if (this.matchKeyword('function')) return this.functionDeclaration();
    if (this.matchKeyword('let')) return this.letDeclaration();
    if (this.matchKeyword('export')) {
      const declaration = this.declaration();
      declaration.exported = true;
      return declaration;
    }
    if (this.matchKeyword('import')) return this.importDeclaration();
    return this.statement();
  }

  importDeclaration() {
    const token = this.previous();
    const source = this.consume(TokenType.STRING, null, 'Expected module path after import.', 'Use import "module-name".');
    this.consumeOptionalTerminator();
    return node('ImportDeclaration', { source: source.value }, token);
  }

  functionDeclaration() {
    const token = this.previous();
    const name = this.consume(TokenType.IDENTIFIER, null, 'Expected function name.', 'Name the function, for example function greet(name) { ... }.');
    this.consume(TokenType.SEPARATOR, '(', 'Expected ( after function name.', 'Add parentheses around parameters.');
    const params = [];
    if (!this.check(TokenType.SEPARATOR, ')')) {
      do {
        params.push(this.consume(TokenType.IDENTIFIER, null, 'Expected parameter name.', 'Parameters must be identifiers.').value);
      } while (this.match(TokenType.SEPARATOR, ','));
    }
    this.consume(TokenType.SEPARATOR, ')', 'Expected ) after parameters.', 'Close the parameter list.');
    const body = this.block();
    return node('FunctionDeclaration', { name: name.value, params, body }, token);
  }

  letDeclaration() {
    const token = this.previous();
    const name = this.consume(TokenType.IDENTIFIER, null, 'Expected variable name after let.', 'Use let name = value.').value;
    const initializer = this.match(TokenType.OPERATOR, '=') ? this.expression() : node('Literal', { value: null }, token);
    this.consumeOptionalTerminator();
    return node('LetDeclaration', { name, initializer }, token);
  }

  statement() {
    if (this.matchKeyword('if')) return this.ifStatement();
    if (this.matchKeyword('while')) return this.whileStatement();
    if (this.matchKeyword('for')) return this.forStatement();
    if (this.matchKeyword('repeat')) return this.repeatStatement();
    if (this.matchKeyword('return')) return this.returnStatement();
    if (this.matchKeyword('break')) return this.controlStatement('BreakStatement');
    if (this.matchKeyword('continue')) return this.controlStatement('ContinueStatement');
    if (this.match(TokenType.SEPARATOR, '{')) return this.finishBlock(this.previous());
    return this.expressionStatement();
  }

  ifStatement() {
    const token = this.previous();
    const test = this.conditionExpression();
    const consequent = this.block();
    let alternate = null;
    if (this.matchKeyword('else')) {
      alternate = this.matchKeyword('if') ? this.ifStatement() : this.block();
    }
    return node('IfStatement', { test, consequent, alternate }, token);
  }

  whileStatement() {
    const token = this.previous();
    const test = this.conditionExpression();
    const body = this.block();
    return node('WhileStatement', { test, body }, token);
  }

  forStatement() {
    const token = this.previous();
    this.consume(TokenType.SEPARATOR, '(', 'Expected ( after for.', 'Use for (let i = 0; i < 10; i = i + 1) { ... }.');

    let initializer = null;
    if (!this.check(TokenType.SEPARATOR, ';')) {
      initializer = this.matchKeyword('let') ? this.letDeclaration() : this.expressionStatement();
    } else {
      this.advance();
    }

    let test = node('Literal', { value: true }, token);
    if (!this.check(TokenType.SEPARATOR, ';')) test = this.expression();
    this.consume(TokenType.SEPARATOR, ';', 'Expected ; after for condition.', 'Separate initializer, condition, and update with semicolons.');

    let update = null;
    if (!this.check(TokenType.SEPARATOR, ')')) update = this.expression();
    this.consume(TokenType.SEPARATOR, ')', 'Expected ) after for clauses.', 'Close the for header before the block.');

    const body = this.block();
    return node('ForStatement', { initializer, test, update, body }, token);
  }

  repeatStatement() {
    const token = this.previous();
    const count = this.conditionExpression();
    const body = this.block();
    return node('RepeatStatement', { count, body }, token);
  }

  returnStatement() {
    const token = this.previous();
    const value = this.isAtEnd() || this.check(TokenType.SEPARATOR, '}') ? node('Literal', { value: null }, token) : this.expression();
    this.consumeOptionalTerminator();
    return node('ReturnStatement', { value }, token);
  }

  controlStatement(type) {
    const token = this.previous();
    this.consumeOptionalTerminator();
    return node(type, {}, token);
  }

  expressionStatement() {
    const expression = this.expression();
    this.consumeOptionalTerminator();
    return node('ExpressionStatement', { expression }, expression);
  }

  block() {
    const brace = this.consume(TokenType.SEPARATOR, '{', 'Expected { to start block.', 'Wrap nested statements in braces.');
    return this.finishBlock(brace);
  }

  finishBlock(token) {
    const body = [];
    while (!this.check(TokenType.SEPARATOR, '}') && !this.isAtEnd()) {
      body.push(this.declaration());
    }
    this.consume(TokenType.SEPARATOR, '}', 'Expected } to close block.', 'Add a matching closing brace.');
    return node('BlockStatement', { body }, token);
  }

  conditionExpression() {
    if (!this.match(TokenType.SEPARATOR, '(')) return this.expression();
    const expression = this.expression();
    this.consume(TokenType.SEPARATOR, ')', 'Expected ) after condition.', 'Close the condition parentheses.');
    return expression;
  }

  expression() {
    return this.assignment();
  }

  assignment() {
    const expression = this.logicalOr();
    if (!this.match(TokenType.OPERATOR, '=')) return expression;

    const equals = this.previous();
    const value = this.assignment();
    if (expression.type === 'Identifier' || expression.type === 'IndexExpression') {
      return node('AssignmentExpression', { target: expression, value }, equals);
    }

    throw new NovaSyntaxError('Invalid assignment target.', equals.line, equals.column, 'Assign to a variable or array index.');
  }

  logicalOr() {
    let expression = this.logicalAnd();
    while (this.match(TokenType.OPERATOR, '||')) {
      const operator = this.previous();
      const right = this.logicalAnd();
      expression = node('LogicalExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  logicalAnd() {
    let expression = this.equality();
    while (this.match(TokenType.OPERATOR, '&&')) {
      const operator = this.previous();
      const right = this.equality();
      expression = node('LogicalExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  equality() {
    let expression = this.comparison();
    while (this.matchAny(TokenType.OPERATOR, ['==', '!='])) {
      const operator = this.previous();
      const right = this.comparison();
      expression = node('BinaryExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  comparison() {
    let expression = this.term();
    while (this.matchAny(TokenType.OPERATOR, ['>', '<', '>=', '<='])) {
      const operator = this.previous();
      const right = this.term();
      expression = node('BinaryExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  term() {
    let expression = this.factor();
    while (this.matchAny(TokenType.OPERATOR, ['+', '-'])) {
      const operator = this.previous();
      const right = this.factor();
      expression = node('BinaryExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  factor() {
    let expression = this.unary();
    while (this.matchAny(TokenType.OPERATOR, ['*', '/', '%'])) {
      const operator = this.previous();
      const right = this.unary();
      expression = node('BinaryExpression', { operator: operator.value, left: expression, right }, operator);
    }
    return expression;
  }

  unary() {
    if (this.matchAny(TokenType.OPERATOR, ['!', '-'])) {
      const operator = this.previous();
      return node('UnaryExpression', { operator: operator.value, argument: this.unary() }, operator);
    }
    return this.call();
  }

  call() {
    let expression = this.primary();

    while (true) {
      if (this.match(TokenType.SEPARATOR, '(')) {
        expression = this.finishCall(expression);
      } else if (this.match(TokenType.SEPARATOR, '[')) {
        const bracket = this.previous();
        const index = this.expression();
        this.consume(TokenType.SEPARATOR, ']', 'Expected ] after index.', 'Close the array index.');
        expression = node('IndexExpression', { object: expression, index }, bracket);
      } else if (this.match(TokenType.SEPARATOR, '.')) {
        const dot = this.previous();
        const property = this.consume(TokenType.IDENTIFIER, null, 'Expected property name after dot.', 'Use a method name like push, pop, length, substring, upper, or lower.');
        expression = node('MemberExpression', { object: expression, property: property.value }, dot);
      } else {
        break;
      }
    }

    return expression;
  }

  finishCall(callee) {
    const token = this.previous();
    const args = [];
    if (!this.check(TokenType.SEPARATOR, ')')) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.SEPARATOR, ','));
    }
    this.consume(TokenType.SEPARATOR, ')', 'Expected ) after arguments.', 'Close the function call.');
    return node('CallExpression', { callee, args }, token);
  }

  primary() {
    if (this.match(TokenType.NUMBER)) return node('Literal', { value: this.previous().value }, this.previous());
    if (this.match(TokenType.STRING)) return node('Literal', { value: this.previous().value }, this.previous());
    if (this.matchKeyword('true')) return node('Literal', { value: true }, this.previous());
    if (this.matchKeyword('false')) return node('Literal', { value: false }, this.previous());
    if (this.matchKeyword('null')) return node('Literal', { value: null }, this.previous());
    if (this.match(TokenType.IDENTIFIER)) return node('Identifier', { name: this.previous().value }, this.previous());

    if (this.match(TokenType.SEPARATOR, '(')) {
      const token = this.previous();
      const expression = this.expression();
      this.consume(TokenType.SEPARATOR, ')', 'Expected ) after expression.', 'Close the parenthesized expression.');
      return node('GroupingExpression', { expression }, token);
    }

    if (this.match(TokenType.SEPARATOR, '[')) {
      const token = this.previous();
      const elements = [];
      if (!this.check(TokenType.SEPARATOR, ']')) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.SEPARATOR, ','));
      }
      this.consume(TokenType.SEPARATOR, ']', 'Expected ] after array literal.', 'Close the array literal.');
      return node('ArrayExpression', { elements }, token);
    }

    const token = this.peek();
    throw new NovaSyntaxError(`Unexpected token '${token.value}'.`, token.line, token.column, 'Start an expression with a value, identifier, (, or [.');
  }

  consumeOptionalTerminator() {
    while (this.match(TokenType.SEPARATOR, ';')) {
      // Multiple semicolons are harmless.
    }
  }

  match(type, value = null) {
    if (!this.check(type, value)) return false;
    this.advance();
    return true;
  }

  matchAny(type, values) {
    if (!values.some((value) => this.check(type, value))) return false;
    this.advance();
    return true;
  }

  matchKeyword(value) {
    return this.match(TokenType.KEYWORD, value);
  }

  consume(type, value, message, suggestion) {
    if (this.check(type, value)) return this.advance();
    const token = this.peek();
    throw new NovaSyntaxError(message, token.line, token.column, suggestion);
  }

  check(type, value = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === type && (value === null || token.value === value);
  }

  advance() {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  peek() {
    return this.tokens[this.current];
  }

  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }
}
