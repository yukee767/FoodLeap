import { Badge } from '@/components/ui/badge';

export function BlockIndicator({ currentBlock }: { currentBlock: 'A' | 'B' | 'C' }) {
  return (
    <div className="flex gap-2">
      <Badge variant={currentBlock === 'A' ? 'default' : 'outline'}>A • Objetivo</Badge>
      <Badge variant={currentBlock === 'B' ? 'default' : 'outline'}>B • Rotina</Badge>
      <Badge variant={currentBlock === 'C' ? 'default' : 'outline'}>C • Paladar</Badge>
    </div>
  );
}
