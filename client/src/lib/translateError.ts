import i18n from '@/i18n';

interface ErrorResponse {
  errorCode: string;
  errorParams?: Record<string, string>;
}

export function translateError(error: ErrorResponse | string): string {
  if (typeof error === 'string') {
    return error;
  }

  const { errorCode, errorParams } = error;
  
  if (!errorCode) {
    return i18n.t('errors.networkError');
  }

  const translationKey = errorCode.replace(/\./g, '.');
  const translation = i18n.t(translationKey, errorParams || {});
  
  if (translation === translationKey) {
    return errorCode;
  }
  
  return translation;
}

export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return typeof obj === 'object' && obj !== null && 'errorCode' in obj;
}
