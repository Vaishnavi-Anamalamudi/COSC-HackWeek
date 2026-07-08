import { KEYWORDS, Token, TokenType } from './Token.js';
import { NovaSyntaxError } from '../interpreter/Errors.js';

const TWO_CHAR_OPERATORS = new Set(['==', '!=', '>=', '<=', '&&', '||']);
const ONE_CHAR_OPERATORS = new Set(['+', '-', '*', '/', '%', '>', '<', '=', '!']);
const SEPARATORS = new Set(['(', ')', '{', '}', '[', ']', ',', ';', '.']);

export class Lexer {
  constructor(source) {
    this.source = String(source || '');
    this.tokens = [];
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  tokenize() {
    while (!this.isAtEnd()) {
      const char = this.peek();

      if (this.isWhitespace(char)) {
        this.consumeWhitespace();
      } else if (char === '/' && this.peekNext() === '/') {
        this.consumeLineComment();
      } else if (char === '/' && this.peekNext() === '*') {
        this.consumeBlockComment();
      } else if (this.isDigit(char)) {
        this.tokens.push(this.consumeNumber());
      } else if (char === '"') {
        this.tokens.push(this.consumeString());
      } else if (this.isIdentifierStart(char)) {
        this.tokens.push(this.consumeIdentifier());
      } else {
        this.tokens.push(this.consumeSymbol());
      }
    }

    this.tokens.push(new Token(TokenType.EOF, 'EOF', this.line, this.column));
    return this.tokens;
  }

  consumeWhitespace() {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  consumeLineComment() {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  consumeBlockComment() {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance();
    this.advance();

    while (!this.isAtEnd()) {
      if (this.peek() === '*' && this.peekNext() === '/') {
        this.advance();
        this.advance();
        return;
      }
      this.advance();
    }

    throw new NovaSyntaxError('Unclosed block comment.', startLine, startColumn, 'Close it with */.');
  }

  consumeNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    let hasDot = false;

    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === '.') {
        if (hasDot || !this.isDigit(this.peekNext())) break;
        hasDot = true;
        value += this.advance();
      } else if (this.isDigit(char)) {
        value += this.advance();
      } else {
        break;
      }
    }

    return new Token(TokenType.NUMBER, Number(value), startLine, startColumn);
  }

  consumeString() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';
    this.advance();

    while (!this.isAtEnd() && this.peek() !== '"') {
      const char = this.advance();
      if (char === '\\') {
        const escaped = this.advance();
        value += this.escapeCharacter(escaped);
      } else {
        value += char;
      }
    }

    if (this.isAtEnd()) {
      throw new NovaSyntaxError('Unterminated string literal.', startLine, startColumn, 'Add a closing double quote.');
    }

    this.advance();
    return new Token(TokenType.STRING, value, startLine, startColumn);
  }

  consumeIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    let value = '';

    while (!this.isAtEnd() && this.isIdentifierPart(this.peek())) {
      value += this.advance();
    }

    return new Token(KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER, value, startLine, startColumn);
  }

  consumeSymbol() {
    const startLine = this.line;
    const startColumn = this.column;
    const two = this.peek() + this.peekNext();

    if (TWO_CHAR_OPERATORS.has(two)) {
      this.advance();
      this.advance();
      return new Token(TokenType.OPERATOR, two, startLine, startColumn);
    }

    const one = this.advance();
    if (ONE_CHAR_OPERATORS.has(one)) return new Token(TokenType.OPERATOR, one, startLine, startColumn);
    if (SEPARATORS.has(one)) return new Token(TokenType.SEPARATOR, one, startLine, startColumn);

    throw new NovaSyntaxError(`Unexpected character '${one}'.`, startLine, startColumn, 'Remove it or wrap text in quotes.');
  }

  escapeCharacter(char) {
    const escapes = {
      n: '\n',
      t: '\t',
      r: '\r',
      '"': '"',
      '\\': '\\'
    };
    return escapes[char] ?? char;
  }

  advance() {
    const char = this.source[this.index++];
    if (char === '\n') {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    return char;
  }

  peek() {
    return this.source[this.index] || '\0';
  }

  peekNext() {
    return this.source[this.index + 1] || '\0';
  }

  isAtEnd() {
    return this.index >= this.source.length;
  }

  isWhitespace(char) {
    return char === ' ' || char === '\r' || char === '\t' || char === '\n';
  }

  isDigit(char) {
    return char >= '0' && char <= '9';
  }

  isIdentifierStart(char) {
    return /[A-Za-z_]/.test(char);
  }

  isIdentifierPart(char) {
    return /[A-Za-z0-9_]/.test(char);
  }
}
