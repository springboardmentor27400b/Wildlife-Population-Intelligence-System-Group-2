import { useState, useCallback } from 'react';

export const usePagination = (initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const setPaginationData = useCallback((totalCount) => {
    setTotal(totalCount);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setTotal(0);
  }, []);

  return {
    page,
    pageSize,
    total,
    setPaginationData,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  };
};
