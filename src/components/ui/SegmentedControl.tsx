type SegmentedControlProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({ value, options, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div aria-label={label} className="grid grid-cols-2 rounded-2xl border border-[color:var(--color-border)] bg-background/70 p-1" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
            option.value === value ? "bg-gold text-background shadow-[0_0_18px_rgb(242_202_80/18%)]" : "text-muted hover:text-ink"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
