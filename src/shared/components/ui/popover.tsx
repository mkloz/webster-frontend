import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" modal {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  side = 'top',
  avoidCollisions = true,
  collisionPadding = 8,
  sideOffset = 0,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        side={side}
        avoidCollisions={avoidCollisions}
        collisionPadding={collisionPadding}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-9999 w-72 rounded-md p-4 shadow-md outline-hidden border-2 ',
          className
        )}
        {...props}>
        <PopoverPrimitive.Arrow className="h-1.5 w-3.25 fill-border"></PopoverPrimitive.Arrow>
        {props.children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
