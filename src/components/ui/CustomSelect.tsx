import { useEffect, useRef, useState } from "react";

interface CustomSelectProps<T> {
  title: string;
  options: { value: T; label: string }[];
  selectedOption: T;
  label?: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

const CustomSelect = <T extends string>({
  title,
  options,
  selectedOption,
  label,
  onChange,
  disabled,
  className,
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || disabled) return;

      const focusedElement = document.activeElement;
      const items = Array.from(selectRef.current?.querySelectorAll("li") || []);

      if (event.key === "Escape") {
        setIsOpen(false);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentIndex = items.indexOf(focusedElement as HTMLLIElement);
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentIndex = items.indexOf(focusedElement as HTMLLIElement);
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, disabled]);

  const handleListScroll = () => {
    if (listRef.current) {
      scrollPositionRef.current = listRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [isOpen]);

  return (
    <div className={`relative w-full`} ref={selectRef}>
      <label className="font-semibold text-dark-foreground">{title}</label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={title}
        aria-disabled={disabled}
        className={`mt-2 p-2 border rounded-md bg-light-background dark:bg-dark-background hover:border-light-secondary dark:hover:border-dark-secondary focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary cursor-pointer text-light-foreground dark:hover:text-dark-foreground dark:text-dark-foreground ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:border-none dark:hover:border-none"
            : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {options.find((option) => option.value === selectedOption)?.label ||
          label ||
          selectedOption}
      </div>
      {isOpen && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className={`absolute z-50 mt-1 w-full bg-light-background dark:bg-dark-background border border-light-secondary dark:border-dark-secondary rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
          onScroll={handleListScroll}
          style={{
            // Ensure dropdown renders above modal
            position: "fixed",
            width: selectRef.current?.clientWidth,
            top: selectRef.current
              ? selectRef.current.getBoundingClientRect().bottom +
                window.scrollY
              : "auto",
            left: selectRef.current
              ? selectRef.current.getBoundingClientRect().left + window.scrollX
              : "auto",
          }}
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === selectedOption}
              tabIndex={0}
              className="px-4 py-2 hover:bg-light-secondary hover:text-dark-foreground dark:hover:bg-dark-secondary hover:cursor-pointer text-light-foreground dark:text-dark-foreground dark:hover:text-dark-background focus:bg-light-secondary dark:focus:bg-dark-secondary focus:outline-none"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
