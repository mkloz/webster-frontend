import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../../shared/constants/query-keys';
import { UserService } from '../../user/services/user.service';

export function userGroupOptions() {
  return queryOptions({
    queryKey: [QueryKeys.USERS_ME],
    queryFn: async () => {
      try {
        return await UserService.me();
      } catch (e) {
        return null;
      }
    },
    staleTime: Infinity,
    refetchInterval: Infinity,
    retry: false
  });
}

export function useAuth() {
  const user = useQuery(userGroupOptions());

  return {
    data: user.data,
    isLoading: user.isLoading,
    isError: user.isError,
    error: user.error,
    isLoggedIn: !!user.data
  };
}
