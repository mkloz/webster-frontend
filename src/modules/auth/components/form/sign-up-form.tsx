import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';

import { GoogleSignInButton } from '../../../../shared/components/common/google-login-button';
import { Separator } from '../../../../shared/components/ui/separator';
import { type RegisterDto, RegisterSchema } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';

export const SignUpForm = () => {
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { isValid, errors },
    getValues
  } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterSchema),
    mode: 'all'
  });

  const { mutate, isPending } = useMutation({
    mutationFn: AuthService.register,
    onSuccess: () => {
      setOpen(true);
      toast.success('Account created successfully');
      toast.info('Please check your email to verify your account');
    }
  });

  const onSubmit = (data: RegisterDto) => {
    mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Sign up</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your details below to create your account.
            <span className="text-center text-foreground">
              {' '}
              Have an account?{' '}
              <Link to={'/login'} className="underline underline-offset-4 text-primary">
                Login
              </Link>
            </span>
          </p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input {...register('name')} id="name" placeholder="John Doe" errorMessage={errors.name?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="m@example.com"
              errorMessage={errors.email?.message}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>

            <PasswordInput id="password" {...register('password')} errorMessage={errors.password?.message} />
          </div>
        </div>
        <div className="grid gap-2 mt-auto">
          <Button type="submit" className="w-full" isLoading={isPending} disabled={!isValid || isPending}>
            Sign up
          </Button>
          <div className="flex items-center justify-between gap-2 w-full">
            <Separator className="w-min! grow" />
            <p className="text-muted-foreground">or</p>
            <Separator className="w-min! grow" />
          </div>
          <GoogleSignInButton label="Login with Google" className="w-full" />
        </div>
      </form>

      <Dialog open={open} onOpenChange={(isOpen: boolean) => isOpen && setOpen(true)}>
        <DialogContent className="sm:max-w-[425px] pointer-events-auto [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center gap-6">
            <DialogTitle>Please activate your account</DialogTitle>
            <DialogDescription>
              We have sent an activation email to <b>{getValues('email') || 'your email'}</b> to activate your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
