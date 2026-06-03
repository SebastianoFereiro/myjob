type FetchAPIOptions = RequestInit & {
  authToken?: string;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

type StrapiErrorResponse = {
  error?: {
    status?: number;
    name?: string;
    message?: string;
  };
};

export function getStrapiURL() {
  return ( 
    process.env.STRAPI_URL ||
    "https://atlantis.myjob.by"
  ).replace(/\/$/, "");
}

export function getStrapiMediaURL(url?: string | null) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${getStrapiURL()}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function fetchAPI<T>(
  path: string,
  options: FetchAPIOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const requestUrl = `${getStrapiURL()}/api${normalizedPath}`;
  const token = options.authToken ?? process.env.STRAPI_API_TOKEN;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
 
  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | StrapiErrorResponse
    | null;

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === "object" && "error" in payload
        ? payload
        : null;
    const message =
      errorPayload?.error?.message || "Ошибка запроса к Strapi";
    throw new Error(message || "Ошибка запроса к Strapi");
  }

  return payload as T;
}
