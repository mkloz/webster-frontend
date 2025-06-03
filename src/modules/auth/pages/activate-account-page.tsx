import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { QueryKeys } from '@/shared/constants/query-keys';

import { TimeUtils } from '../../../shared/utils/time.utils';
import { AuthService } from '../services/auth.service';

export const ActivateAccountPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  if (!token) {
    navigate('/', { replace: true });
    toast.error('Invalid token');
    return null;
  }
  const { isError, isSuccess, isLoading } = useQuery({
    queryKey: [QueryKeys.USER_ACTIVATION, token],
    queryFn: () => AuthService.activate(token),
    enabled: !!token
  });

  useEffect(() => {
    if (isSuccess) {
      TimeUtils.timeout(2000, () => {
        toast.success('Account activated successfully');
        navigate('/login', { replace: true });
      });
    }
  }, [isSuccess]);

  return (
    <div className="h-svh flex items-center justify-center">
      {isLoading && <CgSpinner className="animate-spin h-10 w-10" />}

      {isError && (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-balance text-sm text-muted-foreground">There was an error activating your account</p>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Success</h1>
          <p className="text-balance text-sm text-muted-foreground">Your account has been activated</p>
          <p className="text-balance text-sm text-muted-foreground">You will be redirected to the login in 2 seconds</p>
        </div>
      )}
    </div>
  );
};
