/**
 * customFetch — single network layer for all generated API hooks. Edit
 * only to change auth scheme. Never edit anything under src/api/generated/
 * — orval overwrites it on every codegen run.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Strip trailing slash — EXPO_PUBLIC_API_URL sometimes ships with one,
// and "host//api/foo" trips NestJS routing.
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const TOKEN_KEY = process.env.EXPO_PUBLIC_AUTH_TOKEN_KEY ?? 'auth_token';

export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`Request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * Use in catch blocks — under strict tsc, caught vars are `unknown`,
 * so direct `e.message`/`e.body` access fails TS18046.
 */
export function getErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  if (e instanceof ApiError) {
    const body = e.body as { message?: string } | undefined;
    return body?.message ?? e.message ?? fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  // Ensure exactly one slash between BASE_URL and url.
  const fullUrl = url.startsWith('http')
    ? url
    : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  const token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(fullUrl, { ...options, headers });
  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    let body: unknown = raw;
    try { body = JSON.parse(raw); } catch { /* keep as text */ }
    throw new ApiError(response.status, body);
  }
  if (response.status === 204 || response.status === 304) {
    return null as T;
  }
  return response.json() as Promise<T>;
}