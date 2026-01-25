import React, { useState, useRef, useEffect } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "default";
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  size = "default",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Keep dropdown open when mouse is over trigger or content
  const handleMouseEnter = () => {
    // Don't auto-open on hover, only keep open if already open
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Check if mouse is leaving to the content area
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (
      contentRef.current?.contains(relatedTarget) ||
      triggerRef.current?.contains(relatedTarget)
    ) {
      return; // Don't close if moving between trigger and content
    }
  };

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          size === "default" && "h-9",
          size === "sm" && "h-8",
          isOpen && "border-ring ring-ring/50 ring-[3px]",
          className
        )}
      >
        <span className="line-clamp-1">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={contentRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground absolute z-50 mt-1 min-w-[8rem] origin-top-left overflow-hidden rounded-md border shadow-md animate-in fade-in-0 zoom-in-95",
            "max-h-96 overflow-y-auto"
          )}
          style={{ minWidth: triggerRef.current?.offsetWidth }}
        >
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === selectedValue}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  option.value === selectedValue && "bg-accent/50"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === selectedValue && (
                  <CheckIcon className="size-4 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
