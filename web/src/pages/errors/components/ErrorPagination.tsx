interface ErrorPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ErrorPagination({ page, pageSize, total, onPageChange }: ErrorPaginationProps): JSX.Element {
  const hasPrevious = page > 1;
  const hasNext = page * pageSize < total;

  return (
    <section>
      <p>Page {page} / {Math.max(1, Math.ceil(total / pageSize))} (total: {total})</p>
      <button type='button' disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>Previous</button>
      <button type='button' disabled={!hasNext} onClick={() => onPageChange(page + 1)}>Next</button>
    </section>
  );
}
