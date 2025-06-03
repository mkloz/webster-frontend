import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth, userGroupOptions } from '@/modules/auth/queries/use-auth.query';
import { AuthService } from '@/modules/auth/services/auth.service';
import { useTokens } from '@/modules/auth/stores/tokens.store';
import { UserAvatar } from '@/shared/components/common/user-avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/shared/components/ui/drawer';
import { Separator } from '@/shared/components/ui/separator';

import { useSelectedProjectId } from '../../project/hooks/use-current-project';
import { ColorPaletteSelector } from '../components/color-palette-selector';
import { ProfileForm } from '../components/profile-form';

export const UserMenuSheet = () => {
  const tokens = useTokens();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { clearId } = useSelectedProjectId();
  const { data: user } = useAuth();
  const logout = useMutation({
    mutationFn: () => {
      return AuthService.logout(tokens.tokens?.refreshToken || '');
    },
    onSuccess: () => {
      tokens.deleteTokens();
      queryClient.resetQueries(userGroupOptions());
      navigate('/');
      toast.success('Logged out successfully');
      clearId();
      setOpen(false);
    }
  });

  if (!user) return null;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full ring-offset-2" unstyled>
          <UserAvatar
            className="h-8 w-8"
            user={{
              name: user?.name || 'User',
              avatar: user?.avatar
            }}
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0 overflow-hidden flex flex-col h-full">
        {/* Sticky Header with User Info */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/40 shadow-sm">
          <DrawerHeader className="p-4 pb-2">
            <DrawerTitle className="text-primary">User Settings</DrawerTitle>
            <DrawerDescription>Manage your profile and preferences</DrawerDescription>
          </DrawerHeader>

          {/* User Profile Section - Sticky */}
          <div className="flex items-center gap-3 px-4 pb-4">
            <UserAvatar
              className="h-12 w-12"
              user={{
                name: user.name,
                avatar: user.avatar
              }}
            />
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-container thin-scrollbar hover-show-scrollbar">
          {/* Profile Edit Form */}
          <ProfileForm user={user} />

          <Separator className="my-4" />

          {/* Color Palette Selection */}
          <ColorPaletteSelector />
        </div>

        {/* Sticky Footer with Logout */}
        <div className="sticky bottom-0 mt-auto p-4 bg-background border-t border-border/40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="w-full" onClick={() => logout.mutate()}>
            <LogOut className="mr-2 h-5 w-5" />
            Log out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
