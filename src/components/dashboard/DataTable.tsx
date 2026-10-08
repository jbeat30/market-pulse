'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 라이브러리 제네릭 시그니처 고정 요구
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, never>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  /** 지정 시 페이지네이션 활성화(페이지당 행 수) — 미지정이면 전체를 한 페이지로 표시 */
  pageSize?: number;
  emptyMessage?: string;
}

/** @tanstack/react-table 기반 공용 데이터 테이블 — 헤더 클릭 정렬 + 선택적 페이지네이션 */
export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  pageSize,
  emptyMessage = '데이터가 없습니다',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageSize
      ? { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize } } }
      : {}),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();
                return (
                  <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : sortDirection === 'desc' ? (
                          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" strokeWidth={2} />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-6 text-center text-[13px] text-[var(--foreground-subtle)]">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pageSize && rows.length > 0 && (
        <div className="flex items-center justify-between text-[12px] text-[var(--foreground-subtle)]">
          <span>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 페이지 (전체 {data.length}건)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
