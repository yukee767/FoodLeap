'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { OptionCard } from './OptionCard';
import { optionLabels } from '@/lib/validators/diet';

export function QuestionStep({
  question,
  form,
}: {
  question: { id: number; key: string; question: string; type: string; options: readonly string[]; required: boolean };
  form: UseFormReturn<Record<string, unknown>>;
}) {
  const isMulti = question.type === 'multi_choice';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{question.question}</h2>
      <p className="text-sm text-muted-foreground">
        {isMulti ? (question.key === 'favorite_protein' ? 'Selecione até 3' : 'Selecione uma ou mais') : 'Escolha uma opção'}
        {!question.required && ' • Opcional'}
      </p>

      <Controller
        name={question.key}
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((opt) => {
                const selected = isMulti
                  ? Array.isArray(field.value) && (field.value as string[]).includes(opt)
                  : field.value === opt;
                const label = optionLabels[opt] ?? opt;
                return (
                  <OptionCard
                    key={opt}
                    label={label}
                    value={opt}
                    selected={!!selected}
                    onToggle={() => {
                      if (isMulti) {
                        const cur = (field.value as string[]) ?? [];
                        if (cur.includes(opt)) {
                          field.onChange(cur.filter((v) => v !== opt));
                        } else {
                          if (opt === 'nenhuma') {
                            field.onChange(['nenhuma']);
                          } else {
                            const next = [...cur.filter((v) => v !== 'nenhuma'), opt];
                            // max 3 for favorite_protein
                            if (question.key === 'favorite_protein' && next.length > 3) return;
                            field.onChange(next);
                          }
                        }
                      } else {
                        field.onChange(opt);
                      }
                    }}
                  />
                );
              })}
            </div>
            {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
          </div>
        )}
      />
    </div>
  );
}
