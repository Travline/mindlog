export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiError = {
  name: string;
  httpCode: number;
  message: string;
  isOperational: boolean;
  details?: ApiErrorDetail[];
};