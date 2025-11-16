export class HttpException extends Error {
  constructor(public readonly status: number, message: string, public readonly response?: unknown) {
    super(message);
    this.name = 'HttpException';
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Requisição inválida', payload?: unknown) {
    super(400, message, payload ?? { message });
    this.name = 'BadRequestException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Recurso não encontrado') {
    super(404, message, { message });
    this.name = 'NotFoundException';
  }
}
