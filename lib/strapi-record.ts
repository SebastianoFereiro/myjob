export type StrapiListResponse<T> = {
  data: Array<T | StrapiEntity<T>>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type StrapiSingleResponse<T> = {
  data: T | StrapiEntity<T> | null;
};

export type StrapiEntity<T> = {
  id?: number | string;
  documentId?: string;
  attributes?: T;
};

export function unwrapStrapiRecord<T extends object>(
  record: T | StrapiEntity<T>,
): T & { id?: number | string; documentId?: string } {
  if ("attributes" in record && record.attributes) {
    return {
      id: record.id,
      documentId: record.documentId,
      ...record.attributes,
    };
  }

  return record as T & { id?: number | string; documentId?: string };
}
