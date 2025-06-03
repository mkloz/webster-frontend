'use client';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { config } from '../../../config/config';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { useTokens } from '../../../modules/auth/stores/tokens.store';
import { QueryKeys } from '../../constants/query-keys';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface GoogleSignInProps {
  label?: string;
  className?: string;
}

const GoogleSignIn: FC<GoogleSignInProps> = ({ label, className }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tokents = useTokens();
  const loginMutation = useMutation({
    mutationFn: AuthService.googleLogin,
    onSuccess: (res) => {
      tokents.setTokens(res);
      navigate('/');
      toast.success('Login successful');
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS_ME] });
    }
  });

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.code) {
        toast.error('Google login failed');
        return;
      }
      loginMutation.mutate(tokenResponse.code);
    },
    onError: (error) => toast.error(error.error || 'Google login failed')
  });

  return (
    <Button
      variant={'outline'}
      type="button"
      onClick={() => login()}
      className={cn('font-medium transition-transform enabled:hover:scale-105', className)}>
      <FcGoogle className="mr-4" />
      {label || 'Sign in with Google'}
    </Button>
  );
};

export const GoogleSignInButton: FC<GoogleSignInProps> = (props) => {
  return (
    <GoogleOAuthProvider clientId={config.googleClientId || ''}>
      <GoogleSignIn {...props} />
    </GoogleOAuthProvider>
  );
};
