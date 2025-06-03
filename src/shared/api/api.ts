import ky, { type HTTPError } from 'ky';

import { config } from '@/config/config';

import { type Tokens, tokensStore } from '../../modules/auth/stores/tokens.store';
import { useSelectedProjectId } from '../../modules/project/hooks/use-current-project';

export const apiClient = ky.create({
  prefixUrl: config.apiUrl,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (request.url.includes('auth/refresh') || request.url.includes('auth/logout')) return request;

        const accessToken = tokensStore.getState().tokens?.accessToken;

        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return request;
      }
    ],
    beforeError: [
      async (error) => {
        return error.response.json<HTTPError>();
      }
    ],
    beforeRetry: [
      async ({ request, error }) => {
        if (request.url.includes('refresh')) {
          tokensStore.getState().deleteTokens();
          useSelectedProjectId.getState().clearId();
          window.location.href = '/';
          return;
        }
        if ('status' in error && error.status !== 401) return;
        const refreshToken = tokensStore.getState().tokens?.refreshToken;

        if (!refreshToken) return;

        const res = await apiClient
          .post('auth/refresh', {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          })
          .json<Tokens>();

        tokensStore.getState().setTokens(res);
        request.headers.set('Authorization', `Bearer ${res.accessToken}`);
      }
    ]
  },
  retry: {
    methods: ['get', 'post', 'put', 'patch', 'delete'],
    statusCodes: [401],
    limit: 2
  }
});
