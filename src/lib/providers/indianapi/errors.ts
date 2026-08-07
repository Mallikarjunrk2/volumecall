export type IndianApiErrorCode = 
  | "INVALID_KEY"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "NETWORK_FAILURE";

export class IndianApiError extends Error {
  public status: number;
  public code: IndianApiErrorCode;

  constructor(message: string, status: number, code: IndianApiErrorCode) {
    super(message);
    this.name = "IndianApiError";
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, IndianApiError.prototype);
  }
}
