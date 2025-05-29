import { getBaseUrl } from './getBaseUrl';

/**
 * Server-side fetch utility that automatically handles cookies and base URL
 * @param endpoint - The API endpoint path (e.g., '/api/v1/users/123')
 * @param options - Standard fetch options (method, body, etc.)
 * @returns Promise<Response>
 */
export async function serverFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get base URL
  const baseUrl = getBaseUrl();
  const apiUrl = `${baseUrl}${endpoint}`;
  
  // Get cookies to pass along with the server-side request
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  
  // Convert cookies to string format for the fetch request
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
  
  // Merge headers with default headers
  const defaultHeaders = {
    'Cookie': cookieString,
    'Content-Type': 'application/json'
  };
  
  const mergedHeaders = {
    ...defaultHeaders,
    ...options.headers
  };
  
  // Default options
  const defaultOptions: RequestInit = {
    cache: 'no-store',
    ...options,
    headers: mergedHeaders
  };
  
  return fetch(apiUrl, defaultOptions);
}

/**
 * Convenience wrapper for GET requests
 * @param endpoint - The API endpoint path
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export async function serverGet(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return serverFetch(endpoint, { ...options, method: 'GET' });
}

/**
 * Convenience wrapper for POST requests
 * @param endpoint - The API endpoint path
 * @param body - Request body
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export async function serverPost(
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  return serverFetch(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  });
}

/**
 * Convenience wrapper for PUT requests
 * @param endpoint - The API endpoint path
 * @param body - Request body
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export async function serverPut(
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  return serverFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  });
}

/**
 * Convenience wrapper for DELETE requests
 * @param endpoint - The API endpoint path
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export async function serverDelete(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  return serverFetch(endpoint, { ...options, method: 'DELETE' });
}
