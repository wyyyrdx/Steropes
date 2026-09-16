import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, ApiError } from '../client';
import { API_BASE_URL } from '@/constants';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on ok', async () => {
    const mockData = { hello: 'world' };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }));
    
    const res = await apiFetch('/test');
    expect(res).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/test`, expect.anything());
  });

  it('throws ApiError on non-ok response', async () => {
    const errorBody = { error: 'Bad Request' };
    vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify(errorBody), { status: 400, statusText: 'Bad Request' }));

    await expect(apiFetch('/test')).rejects.toThrow(ApiError);
    await expect(apiFetch('/test')).rejects.toThrow('Bad Request');
  });

  it('propagates abort correctly', async () => {
    const controller = new AbortController();
    vi.mocked(fetch).mockImplementationOnce(async (...args: any[]) => {
      const init = args[1];
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const promise = apiFetch('/test', { signal: controller.signal });
    controller.abort();
    
    await expect(promise).rejects.toThrow('The operation was aborted');
  });
});
