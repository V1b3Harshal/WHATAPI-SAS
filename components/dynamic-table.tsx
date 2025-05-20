//components\dynamic-table.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DataType = "string" | "number" | "date" | "boolean" | "array" | "object" | "unknown";

export interface ColumnConfig {
  key: string;
  label: string;
  type?: DataType;
  format?: (value: any, row?: any) => React.ReactNode;
  sortable?: boolean;
  className?: string; // Add this
}

export interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

export interface FilterState {
  logicOperator: "AND" | "OR";
  rules: FilterRule[];
}

export interface PredefinedFilter {
  name: string;
  filters: Omit<FilterRule, "value">[];
}

export interface DynamicTableProps {
  data: Record<string, any>[];
  columns?: ColumnConfig[];
  pageSize?: number;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  predefinedFilters?: PredefinedFilter[];
  defaultSort?: { key: string; direction: "asc" | "desc" };
  rowClassName?: (row: any) => string;
  className?: string;
  filterOptions?: {
    stringOperators?: string[];
    numberOperators?: string[];
    dateOperators?: string[];
    booleanOperators?: string[];
  };
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  data = [],
  columns,
  pageSize = 10,
  searchable = true,
  sortable = true,
  filterable = true,
  predefinedFilters = [],
  defaultSort,
}) => {
  // Table states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    defaultSort || null
  );
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [filterState, setFilterState] = useState<FilterState>({ 
    logicOperator: "AND", 
    rules: [] 
  });
  const [activeFilters, setActiveFilters] = useState<FilterState>({ 
    logicOperator: "AND", 
    rules: [] 
  });
  const [activePredefinedFilter, setActivePredefinedFilter] = useState<string | null>(null);

  // Auto-detect columns if not provided
  const autoColumns: ColumnConfig[] = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (data.length === 0) return [];
    
    const keys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
    return keys.map(key => {
      const sample = data.find(item => item[key] !== undefined)?.[key];
      const detectedType = detectDataType(sample);
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: detectedType,
        sortable: true,
      };
    });
  }, [columns, data]);

  // Helper function to detect data type
  const detectDataType = (value: any): DataType => {
    if (value === null || value === undefined) return "unknown";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)?$/.test(value) && !isNaN(Date.parse(value))) {
        return "date";
      }
      return "string";
    }
    if (typeof value === "object") return "object";
    return "unknown";
  };

  // Filter evaluation logic
  const evaluateFilterRule = (value: any, rule: FilterRule, type: DataType) => {
    if (value === null || value === undefined) return false;
    
    const strValue = String(value).toLowerCase();
    const filterValue = rule.value.toLowerCase();

    switch (rule.operator) {
      case "=": return type === "boolean" ? 
        (value === true && filterValue === "true") || (value === false && filterValue === "false") :
        strValue === filterValue;
      case "!=": return type === "boolean" ?
        (value === true && filterValue !== "true") || (value === false && filterValue !== "false") :
        strValue !== filterValue;
      case ">": return type === "date" ? 
        new Date(value) > new Date(rule.value) : Number(value) > Number(rule.value);
      case "<": return type === "date" ? 
        new Date(value) < new Date(rule.value) : Number(value) < Number(rule.value);
      case ">=": return type === "date" ? 
        new Date(value) >= new Date(rule.value) : Number(value) >= Number(rule.value);
      case "<=": return type === "date" ? 
        new Date(value) <= new Date(rule.value) : Number(value) <= Number(rule.value);
      case "contains": return strValue.includes(filterValue);
      case "startsWith": return strValue.startsWith(filterValue);
      case "endsWith": return strValue.endsWith(filterValue);
      default: return false;
    }
  };

  // Get operators for specific data type
  const getOperatorsForType = (type: DataType) => {
    const defaultOperators = [
      { value: "=", label: "equals" },
      { value: "!=", label: "not equals" },
    ];
  
    const typeOperators = {
      string: filterOptions?.stringOperators || ["contains", "startsWith", "endsWith"],
      number: filterOptions?.numberOperators || [">", "<", ">=", "<="],
      date: filterOptions?.dateOperators || [">", "<", ">=", "<="],
      boolean: filterOptions?.booleanOperators || [],
    };
  
    const operators = [
      ...defaultOperators,
      ...(typeOperators[type]?.map(op => ({
        value: op,
        label: op === ">" ? "greater than" :
               op === "<" ? "less than" :
               op === ">=" ? "greater or equal" :
               op === "<=" ? "less or equal" :
               op === "contains" ? "contains" :
               op === "startsWith" ? "starts with" :
               op === "endsWith" ? "ends with" :
               op
      })) || [])
    ];
  
    return operators;
  };

  // Apply predefined filter
  const applyPredefinedFilter = (filterName: string) => {
    const filter = predefinedFilters.find(f => f.name === filterName);
    if (!filter) return;

    const newRules = filter.filters.map(rule => ({
      ...rule,
      value: rule.operator === "=" ? "true" : "false" // Default values for predefined filters
    }));

    setActivePredefinedFilter(filterName);
    setFilterState({ logicOperator: "AND", rules: newRules });
    setActiveFilters({ logicOperator: "AND", rules: newRules });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActivePredefinedFilter(null);
    setFilterState({ logicOperator: "AND", rules: [] });
    setActiveFilters({ logicOperator: "AND", rules: [] });
    setCurrentPage(1);
  };

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        autoColumns.some(col => {
          const value = row[col.key];
          return value !== undefined && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply advanced filters
    if (activeFilters.rules.length > 0) {
      result = result.filter(row => {
        const ruleResults = activeFilters.rules.map(rule => {
          const column = autoColumns.find(col => col.key === rule.field);
          const type = column?.type || "string";
          const value = row[rule.field];
          return evaluateFilterRule(value, rule, type);
        });
        return activeFilters.logicOperator === "AND" 
          ? ruleResults.every(Boolean) 
          : ruleResults.some(Boolean);
      });
    }

    return result;
  }, [data, searchQuery, activeFilters, autoColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / currentPageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * currentPageSize;
    return sortedData.slice(startIndex, startIndex + currentPageSize);
  }, [sortedData, currentPage, currentPageSize]);

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, currentPageSize]);

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {searchable && (
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Predefined Filters */}
          {filterable && predefinedFilters.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Filter className="mr-2 h-4 w-4" />
                  Quick Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <div className="grid">
                  {predefinedFilters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start",
                        activePredefinedFilter === filter.name && "bg-accent"
                      )}
                      onClick={() => applyPredefinedFilter(filter.name)}
                    >
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Advanced Filters */}
          {filterable && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Advanced Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Advanced Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Match:</span>
                    <Button
                      variant={filterState.logicOperator === "AND" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterState({ ...filterState, logicOperator: "AND" })}
                    >
                      All conditions (AND)
                    </Button>
                    <Button
                      variant={filterState.logicOperator === "OR" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterState({ ...filterState, logicOperator: "OR" })}
                    >
                      Any condition (OR)
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {filterState.rules.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No filters applied
                      </div>
                    ) : (
                      filterState.rules.map((rule, index) => {
                        const column = autoColumns.find(col => col.key === rule.field);
                        const type = column?.type || "string";
                        const operators = getOperatorsForType(type);

                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Select
                              value={rule.field}
                              onValueChange={(value) => {
                                const newRules = [...filterState.rules];
                                newRules[index].field = value;
                                setFilterState({ ...filterState, rules: newRules });
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {autoColumns.map(col => (
                                  <SelectItem key={col.key} value={col.key}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={rule.operator}
                              onValueChange={(value) => {
                                const newRules = [...filterState.rules];
                                newRules[index].operator = value;
                                setFilterState({ ...filterState, rules: newRules });
                              }}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              value={rule.value}
                              onChange={(e) => {
                                const newRules = [...filterState.rules];
                                newRules[index].value = e.target.value;
                                setFilterState({ ...filterState, rules: newRules });
                              }}
                              placeholder="Value"
                              className="flex-1"
                            />

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newRules = [...filterState.rules];
                                newRules.splice(index, 1);
                                setFilterState({ ...filterState, rules: newRules });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setFilterState({
                        ...filterState,
                        rules: [...filterState.rules, { field: autoColumns[0]?.key || "", operator: "=", value: "" }]
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Condition
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button onClick={() => {
                    setActiveFilters(filterState);
                    setActivePredefinedFilter(null);
                  }}>
                    Apply Filters
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {(searchQuery || activeFilters.rules.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Badges */}
      {(searchQuery || activeFilters.rules.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="px-3 py-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {activeFilters.rules.map((rule, index) => {
            const column = autoColumns.find(col => col.key === rule.field);
            return (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {column?.label || rule.field} {rule.operator} {rule.value}
                <button 
                  onClick={() => {
                    const newRules = [...activeFilters.rules];
                    newRules.splice(index, 1);
                    setActiveFilters({ ...activeFilters, rules: newRules });
                  }} 
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {autoColumns.map(column => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap",
                    column.sortable && sortable && "cursor-pointer hover:bg-muted/80"
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {autoColumns.map(column => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {column.format 
                        ? column.format(row[column.key], row) 
                        : String(row[column.key] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={autoColumns.length} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} item(s)
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentPageSize.toString()}
            onValueChange={(value) => {
              setCurrentPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-sm">
              Page {currentPage} of {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;