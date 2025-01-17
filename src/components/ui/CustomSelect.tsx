import { useEffect, useRef, useState } from "react";

interface CustomSelectProps<T> {
  label: string;
  options: { value: T; label: string }[];
  selectedOption: T;
  onChange: (value: T) => void;
  disabled?: boolean; // Add disabled prop
}

const CustomSelect = <T extends string>({
  label,
  options,
  selectedOption,
  onChange,
  disabled, // Destructure disabled prop
}: CustomSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

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
      if (!isOpen || disabled) return; // Skip if disabled

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
  }, [isOpen, disabled]); // Add disabled to dependencies

  return (
    <div className="relative" ref={selectRef}>
      <label className="font-semibold text-dark-foreground">{label}</label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0} // Disable tab index if disabled
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
        aria-disabled={disabled} // Indicate disabled state
        className={`mt-2 p-2 border rounded-md bg-light-background dark:bg-dark-background hover:border-light-secondary dark:hover:border-dark-secondary focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary cursor-pointer text-light-foreground dark:hover:text-dark-foreground dark:text-dark-foreground ${
          disabled
            ? "opacity-50 cursor-not-allowed hover:border-none dark:hover:border-none"
            : ""
        }`} // Add disabled styles
        onClick={() => !disabled && setIsOpen(!isOpen)} // Only toggle if not disabled
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {options.find((option) => option.value === selectedOption)?.label ||
          selectedOption}
      </div>
      {isOpen &&
        !disabled && ( // Only render dropdown if not disabled
          <ul
            role="listbox"
            className="absolute z-10 mt-1 w-full bg-light-background dark:bg-dark-background border border-light-secondary dark:border-dark-secondary rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === selectedOption}
                tabIndex={0}
                className="px-4 py-2 hover:bg-light-secondary dark:hover:bg-dark-secondary hover:cursor-pointer text-light-foreground dark:text-dark-foreground dark:hover:text-dark-background focus:bg-light-secondary dark:focus:bg-dark-secondary focus:outline-none"
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
