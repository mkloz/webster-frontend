import type React from 'react';
import type { ElementType } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { HashLink } from 'react-router-hash-link';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../ui/button';

interface ConditionalLinkProps extends Omit<React.ComponentProps<typeof HashLink>, 'to'> {
  to?: string;
  as?: ElementType;
}

export const ConditionalLink: React.FC<ConditionalLinkProps> = ({ to, as = 'div', ...rest }) => {
  const Wrapper = to ? Link : as;

  return <Wrapper {...rest} to={to} />;
};

interface LinkProps extends React.ComponentProps<typeof HashLink> {
  withArrowRight?: boolean;
  withArrowLeft?: boolean;
  unstyled?: boolean;
}

export const Link = ({ onClick, withArrowRight, withArrowLeft, unstyled = false, ...props }: LinkProps) => {
  return (
    <HashLink
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (props.to !== window.location.pathname && !props.to.toString().includes('#')) window.scrollTo(0, 0);
      }}
      className={cn(
        !unstyled && buttonVariants({ variant: 'link' }),
        'min-h-fit',
        (withArrowRight || withArrowLeft) && 'flex items-center group gap-1',
        props.className
      )}>
      {withArrowLeft && (
        <FiArrowLeft className="h-full aspect-square transform group-hover:-translate-x-1 transition-transform duration-300 stroke-3" />
      )}
      {props.children}
      {withArrowRight && (
        <FiArrowRight className="h-full aspect-square transform group-hover:translate-x-1 transition-transform duration-300 stroke-3" />
      )}
    </HashLink>
  );
};
