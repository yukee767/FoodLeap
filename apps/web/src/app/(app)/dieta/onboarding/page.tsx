import { Suspense } from 'react';
import { DietWizard } from '@/components/diet/DietWizard';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DietWizard />
      </Suspense>
    </div>
  );
}
