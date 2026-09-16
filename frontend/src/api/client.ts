import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
  let signal = options?.signal;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (!signal) {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    signal = controller.signal;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
      signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const body = await response.json();
        errorMessage = body.error ?? errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(response.status, errorMessage);
    }

    return await response.json() as T;
  } catch (err: unknown) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError' && !options?.signal) {
      throw new ApiError(408, 'Request timed out');
    }
    throw err;
  }
}
