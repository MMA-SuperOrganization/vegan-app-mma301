interface Page<T> {
  data: T[];
  meta?: { page: number; totalPages: number };
}

/** Collect all pages so daily totals and history never silently stop at page one. */
export async function collectPages<T, P extends Page<T>>(
  fetchPage: (page: number) => Promise<P>
): Promise<P> {
  const first = await fetchPage(1);
  const data = [...first.data];
  for (let page = 2; page <= (first.meta?.totalPages ?? 1); page++) {
    const next = await fetchPage(page);
    data.push(...next.data);
  }
  return { ...first, data };
}
