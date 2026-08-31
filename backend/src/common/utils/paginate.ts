import type { Paginated } from '../dto/pagination-query.dto.js';

/**
 * Builds a consistent { data, meta } paginated response from an already
 * page-sliced result set plus the total row count.
 */
export function buildPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function paginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
