export class NovaError extends Error {
  constructor(kind, message, line = 1, column = 1, suggestion = 'Check the surrounding code.') {
    super(message);
    this.name = kind;
    this.kind = kind;
    this.line = line;
    this.column = column;
    this.suggestion = suggestion;
  }

  toDiagnostic() {
    return {
      kind: this.kind,
      message: this.message,
      line: this.line,
      column: this.column,
      suggestion: this.suggestion
    };
  }
}

export class NovaSyntaxError extends NovaError {
  constructor(message, line, column, suggestion) {
    super('SyntaxError', message, line, column, suggestion);
  }
}

export class NovaRuntimeError extends NovaError {
  constructor(message, line, column, suggestion) {
    super('RuntimeError', message, line, column, suggestion);
  }
}

export class ReturnSignal {
  constructor(value) {
    this.value = value;
  }
}

export class BreakSignal {}

export class ContinueSignal {}
