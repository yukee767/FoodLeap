import { Progress } from '@/components/ui/progress';

export function ProgressBar({ value, step, total = 15 }: { value: number; step: number; total?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Pergunta {step} de {total}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
