import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { PasswordInput } from '@/shared/components/ui/password-input';

import { PasswordValidator } from '../../../../shared/validators/password.validator';
import { AuthService } from '../../services/auth.service';
import { useTokens } from '../../stores/tokens.store';

const ResetPasswordSchema = z.object({
  password: PasswordValidator
});
type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ token }) => {
  const navigate = useNavigate();
  const { deleteTokens } = useTokens();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid }
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'all'
  });

  const { mutate, isPending } = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful');
      toast.info('You can now log in with your new password');
      deleteTokens();
      navigate('/login', {
        replace: true
      });
    }
  });

  const onSubmit = (data: ResetPasswordType) => {
    mutate({
      token,
      password: data.password
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your new password below</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>

          <PasswordInput id="password" {...register('password')} errorMessage={errors.password?.message} />
        </div>
        <Button type="submit" className="w-full" isLoading={isPending} disabled={!isValid || isPending}>
          Reset
        </Button>
      </div>
    </form>
  );
};
