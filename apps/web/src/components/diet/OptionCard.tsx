'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OptionCard({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string;
  value: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between rounded-xl border p-4 text-left transition',
        selected ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary' : 'border-input bg-background hover:bg-accent',
        disabled && 'opacity-50 pointer-events-none'
      )}
      aria-pressed={selected}
    >
      <span className="font-medium capitalize text-sm">{label.replaceAll('_', ' ')}</span>
      {selected && <Check className="h-4 w-4" />}
    </button>
  );
}
