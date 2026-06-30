export function getApiBaseUrl(): string {
  // if (typeof window !== "undefined") {
  //   return "";
  // }

  const baseUrl = process.env.NODE_ENV === "production" ? "https://sms-backend-woad.vercel.app" : "http://localhost:3000";

  return baseUrl ?? "http://localhost:3000";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  console.log(`URL: \n${baseUrl}${path}`);
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data =
    response.status === 204
      ? {}
      : await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      response.status,
    );
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
