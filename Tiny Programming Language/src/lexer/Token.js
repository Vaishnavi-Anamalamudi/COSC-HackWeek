export const TokenType = Object.freeze({
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD',
  OPERATOR: 'OPERATOR',
  SEPARATOR: 'SEPARATOR',
  EOF: 'EOF'
});

export const KEYWORDS = new Set([
  'let',
  'if',
  'else',
  'while',
  'for',
  'repeat',
  'function',
  'return',
  'true',
  'false',
  'null',
  'break',
  'continue',
  'import',
  'export'
]);

export class Token {
  constructor(type, value, line, column) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `${this.type}(${this.value}) at ${this.line}:${this.column}`;
  }
}
