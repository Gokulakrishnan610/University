import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  searchValue?: string;
}

export function SearchableDropdown({
  options,
  value,
  onValueChange,
  onSearchChange,
  onPageChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  className,
  disabled = false,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  searchValue = "",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedSearchValue = useDebounce(localSearchValue, 300);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Propagate search changes to parent
  useEffect(() => {
    if (debouncedSearchValue !== searchValue) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearchChange, searchValue]);

  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (currentPage < totalPages && !isLoading && scrollPercentage > 80) {
        onPageChange(currentPage + 1);
      }
    }
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between font-normal"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
          {/* Search input */}
          <div className="relative p-2 border-b">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 h-8"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            className="h-[200px] overflow-y-auto p-1 py-2"
            onScroll={handleScroll}
          >
            {isLoading && options.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <span>Loading options...</span>
              </div>
            ) : options.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <>
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onValueChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm relative select-none",
                      "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent/50"
                    )}
                  >
                    <span className="flex-1 truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))}
                {isLoading && options.length > 0 && (
                  <div className="flex justify-center items-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && currentPage < totalPages && (
                  <div 
                    className="flex justify-center items-center p-2 cursor-pointer hover:bg-accent/30 text-sm rounded-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                  >
                    Load more...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 