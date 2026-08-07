import type { Metadata } from 'next';

type SearchParamValue = string | string[] | undefined;

/**
 * Query-параметры, которые никогда не влияют на контент страницы
 * (трекинговые и служебные). Отбрасываются из canonical URL.
 */
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'msclkid',
  'twclid',
  'yclid',
  'ref',
  'source',
  'from',
  'sd',
]);

/**
 * Строит абсолютный canonical URL для страницы.
 *
 * Сохраняет только параметры из `consumedParams`, присутствующие в `searchParams`
 * и не входящие в трекинговые. Неизвестные/трекинговые параметры отбрасываются,
 * поэтому URL вида `/jobs?query=dev&sd=0` схлопывается в `/jobs?query=dev`.
 * `page=1` — дубль базовой версии, поэтому также схлопывается.
 *
 * @param pathname путь страницы (например `/categories/it`)
 * @param searchParams объект searchParams из страницы
 * @param consumedParams список параметров, реально влияющих на контент этой страницы
 */
export function buildCanonicalUrl(
  pathname: string,
  searchParams: Readonly<Record<string, SearchParamValue>> = {},
  consumedParams: readonly string[] = [],
): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  const qs = new URLSearchParams();
  for (const key of consumedParams) {
    if (TRACKING_PARAMS.has(key)) continue;
    const value = searchParams[key];
    if (value === undefined) continue;
    if (key === 'page' && value === '1') continue;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== '') qs.append(key, v);
      });
    } else if (value !== '') {
      qs.set(key, value);
    }
  }

  const query = qs.toString();
  return `${base}${cleanPath}${query ? `?${query}` : ''}`;
}

/**
 * Добавляет автоматический canonical в Metadata, не перезаписывая
 * явный canonical из Strapi SEO (SEO.canonicalURL).
 */
export function withAutoCanonical(
  metadata: Metadata,
  pathname: string,
  searchParams: Readonly<Record<string, SearchParamValue>> = {},
  consumedParams?: readonly string[],
): Metadata {
  if (metadata.alternates?.canonical) return metadata;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: buildCanonicalUrl(pathname, searchParams, consumedParams),
    },
  };
}
