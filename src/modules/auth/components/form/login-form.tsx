import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { PasswordInput } from '@/shared/components/ui/password-input';

import { GoogleSignInButton } from '../../../../shared/components/common/google-login-button';
import { Separator } from '../../../../shared/components/ui/separator';
import { type LoginDto, LoginSchema } from '../../interfaces/auth.interface';
import { userGroupOptions } from '../../queries/use-auth.query';
import { AuthService } from '../../services/auth.service';
import { useTokens } from '../../stores/tokens.store';

export const LoginForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setTokens } = useTokens();

  const {
    handleSubmit,
    register,
    formState: { isValid, errors }
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    mode: 'all'
  });
  const { mutate, isPending } = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      setTokens(data);
      queryClient.invalidateQueries(userGroupOptions());
      navigate('/', { replace: true });
      toast.success('Logged in successfully');
    }
  });

  const onSubmit = (data: LoginDto) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account.{' '}
          <span className="text-center text-foreground">
            Don&apos;t have an account?{' '}
            <Link to={'/sign-up'} className="underline underline-offset-4 text-primary">
              Sign up
            </Link>
          </span>
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input {...register('email')} type="email" placeholder="m@example.com" errorMessage={errors.email?.message} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link to={'/forgot-password'} className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <PasswordInput
            {...register('password')}
            placeholder="secure password"
            errorMessage={errors.password?.message}
          />
        </div>
      </div>
      <div className="grid gap-2 mt-auto  ">
        <Button type="submit" className="w-full mt-auto" isLoading={isPending} disabled={!isValid || isPending}>
          Login
        </Button>
        <div className="flex items-center justify-between gap-2 w-full">
          <Separator className="w-min! grow" />
          <p className="text-muted-foreground">or</p>
          <Separator className="w-min! grow" />
        </div>
        <GoogleSignInButton label="Login with Google" className="w-full" />
      </div>
    </form>
  );
};
