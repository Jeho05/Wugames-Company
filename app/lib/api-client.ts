type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL est requis pour appeler le back-end WUGAMS."
    );
  }

  return baseUrl + (path.startsWith("/") ? path : "/" + path);
}

export async function apiFetch<T>(
  path: string,
  { accessToken, body, headers, ...options }: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...options,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "La requête API a échoué.";

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}
