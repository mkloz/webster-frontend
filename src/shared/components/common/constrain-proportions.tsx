import { Lock, LockOpen } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

interface ConstrainProportionsProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

export const ConstrainProporions = ({ checked, onCheckedChange }: ConstrainProportionsProps) => {
  return (
    <div className="flex items-center justify-center text-muted-foreground mt-6">
      <Button variant={checked ? 'default' : 'outline'} size="icon-xs" onClick={() => onCheckedChange(!checked)}>
        {checked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
      </Button>
    </div>
  );
};
