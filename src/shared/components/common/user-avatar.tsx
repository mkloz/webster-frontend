import type { FC } from 'react';

import { cn } from '../../lib/utils';
import { Image } from './image';

interface UserAvatarProps {
  user: {
    avatar?: string | null;
    name?: string | null;
  } | null;
  className?: string;
}
const getInitials = (fullName?: string | null) => {
  if (!fullName) return '';

  return (
    fullName
      .split(' ') // Split by space
      .filter(Boolean) // Remove empty strings
      .map((name) => name[0].toUpperCase()) // Take first character, capitalize
      .slice(0, 2) // Take first two initials
      .join('') || ''
  ); // Join into initials
};

const AvatarFallback: FC<UserAvatarProps> = ({ user }) => {
  return (
    <div className="bg-muted flex w-full h-full bg-gradient-to-br from-gradient-start to-gradient-end">
      <span className="text-sm font-semibold text-primary-foreground m-auto">{getInitials(user?.name)}</span>
    </div>
  );
};

export const UserAvatar: FC<UserAvatarProps> = ({ className, user }) => {
  return (
    <Image
      src={user?.avatar || ''}
      alt={user?.name || ''}
      className={cn('rounded-full w-full h-full object-cover object-center', className)}
      noImageComponent={<AvatarFallback user={user} />}
      fallbackComponent={<AvatarFallback user={user} />}
      wrapperClassName={cn(
        'rounded-full overflow-hidden aspect-square  hover:brightness-95 transition-colors border-transparent outline-2 outline-primary',
        className
      )}
    />
  );
};
