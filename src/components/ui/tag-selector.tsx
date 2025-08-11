import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  placeholder = "Chọn thẻ...",
  label = "Thẻ",
  className
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    onTagsChange(newSelectedTags);
  };

  const removeTag = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newSelectedTags);
  };

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-[6px]">
        {label}
      </label>

      <div className="relative" ref={dropdownRef}>
        <Button
          type="button" // Add this to prevent form submission
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between cursor-pointer py-[18px]"
          onClick={() => setOpen(!open)}
        >
          {selectedTags.length === 0
            ? placeholder
            : `${selectedTags.length} thẻ đã chọn`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
            <div className="p-2 border-b">
              <Input
                placeholder="Tìm kiếm thẻ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Không tìm thấy thẻ.
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button" // Add this to prevent form submission
                    className={cn(
                      "w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      selectedTags.includes(tag) && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags displayed below the input */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold"
            >
              <span>{tag}</span>
              <button
                type="button" // Add this to prevent form submission
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
              >
                <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}