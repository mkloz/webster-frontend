import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { userGroupOptions } from '@/modules/auth/queries/use-auth.query';
import { AuthService } from '@/modules/auth/services/auth.service';
import { UserService } from '@/modules/user/services/user.service';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { AvatarUpload } from './avatar-upload';

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const [name, setName] = useState(user.name || '');
  const [resetEmailCooldown, setResetEmailCooldown] = useState(0);
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: () => UserService.updateUserData({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(userGroupOptions());
      toast.success('Profile updated successfully');
    }
  });

  const sendPasswordResetEmail = useMutation({
    mutationFn: () => AuthService.sendResetPasswordLink({ email: user.email }),
    onSuccess: () => {
      toast.success('Password reset email sent successfully');
    }
  });

  const handleResetPasswordEmail = async () => {
    await sendPasswordResetEmail.mutateAsync();
    setResetEmailCooldown(60);

    const timer = setInterval(() => {
      setResetEmailCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold mb-2 text-foreground">Edit Profile</h3>

      <AvatarUpload user={user} />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name" className="text-sm text-muted-foreground">
            Full Name
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg" />
        </div>

        <Button
          className="w-full"
          onClick={() => updateUser.mutateAsync()}
          disabled={!name || updateUser.isPending}
          isLoading={updateUser.isPending}>
          Save Profile
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleResetPasswordEmail}
          disabled={!user.email || sendPasswordResetEmail.isPending || resetEmailCooldown > 0}
          isLoading={sendPasswordResetEmail.isPending}>
          {resetEmailCooldown > 0 ? `Try again in ${resetEmailCooldown}s` : 'Send Password Reset Email'}
        </Button>
      </div>
    </div>
  );
};
