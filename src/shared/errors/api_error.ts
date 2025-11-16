export class ApiError extends Error {
  errors?: { field: string; message: string }[];
  code?: string;
  message: string;
  status: number;

  constructor({
    errors,
    code,
    message = "Internal server error",
    status = 500,
  }: {
    errors?: { field: string; message: string }[];
    code?: string;
    message?: string;
    status?: number;
  }) {
    super(message);
    this.errors = errors;
    this.code = code;
    this.message = message;
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
