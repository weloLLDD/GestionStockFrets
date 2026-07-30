"use client"

import type React from "react"
import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

export interface TableFilter {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  filters?: TableFilter[]
  filterAccessor?: (row: T, key: string) => string
  pageSize?: number
  emptyMessage?: string
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = "Rechercher...",
  filters = [],
  filterAccessor,
  pageSize = 8,
  emptyMessage = "Aucun résultat trouvé.",
  actions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchesQuery =
        query === "" ||
        searchKeys.some((key) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      const matchesFilters = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "all") return true
          const accessor = filterAccessor
            ? filterAccessor(row, key)
            : String((row as Record<string, unknown>)[key] ?? "")
          return accessor === value
        },
      )
      return matchesQuery && matchesFilters
    })
  }, [data, query, searchKeys, activeFilters, filterAccessor])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className="flex flex-col gap-4">
      {(searchKeys.length > 0 || filters.length > 0) && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {searchKeys.length > 0 && (
            <div className="relative w-full md:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  value={activeFilters[filter.key] ?? "all"}
                  onValueChange={(value) => {
                    setActiveFilters((prev) => ({ ...prev, [filter.key]: value }))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder={filter.label}>
                      {!activeFilters[filter.key] || activeFilters[filter.key] === "all"
                        ? filter.label
                        : (filter.options.find((o) => o.value === activeFilters[filter.key])?.label ??
                          filter.label)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{filter.label} : Tous</SelectItem>
                    {filter.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`whitespace-nowrap font-semibold text-foreground ${col.className ?? ""}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="text-right font-semibold text-foreground">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Inbox className="size-8" />
                      <span className="text-sm">{emptyMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`whitespace-nowrap ${col.className ?? ""}`}
                      >
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right">{actions(row)}</TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="size-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Suivant
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
