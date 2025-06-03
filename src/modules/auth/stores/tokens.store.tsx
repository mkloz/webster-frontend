import { z } from 'zod';
import { createStore, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const TokensValidator = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export type Tokens = z.infer<typeof TokensValidator>;
interface TokensStore {
  tokens: Tokens | null;
  setTokens: (tokens: Tokens) => void;
  deleteTokens: () => void;
}

const TOKENS_STORAGE_KEY = 'tokens';

export const tokensStore = createStore(
  persist<TokensStore>(
    (set) => ({
      tokens: null,
      setTokens: (tokens) => set({ tokens }),
      deleteTokens: () => set({ tokens: null })
    }),
    { name: TOKENS_STORAGE_KEY, storage: createJSONStorage(() => localStorage) }
  )
);

export const useTokens = () => useStore(tokensStore);
