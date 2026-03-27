import { auth } from './firebase';

export const API = 'http://localhost:3000';

/**
 * A drop-in replacement for `fetch` that automatically attaches
 * the current user's Firebase ID token as a Bearer header.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  let token: string | null = null;
  if (user) {
    try {
      token = await user.getIdToken();
    } catch {
      // continue without token if refresh fails
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}
