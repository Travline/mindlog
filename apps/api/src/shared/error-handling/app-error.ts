import HttpCode from "@/shared/enums/http-code";

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;
  public readonly isOperational: boolean;
  public readonly details?: {}[];

  constructor(name: string, httpCode: HttpCode, description: string, isOperational: boolean, details?: {}[]) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this);
  }
}
