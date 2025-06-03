import './styles/style.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { toast } from 'sonner';

import { CanvasProvider } from './modules/canvas/hooks/use-canvas-context';
import { Router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    },
    mutations: {
      retry: false,
      onError(error) {
        const messagesToIgnore: string[] = ['refresh', 'Unauthorized', 'undefined'];
        if (messagesToIgnore.some((message) => error.message.toLowerCase().includes(message.toLowerCase()))) return;

        toast.error(error.message);
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CanvasProvider>
        <NuqsAdapter>
          <Router />
          <ReactQueryDevtools initialIsOpen={false} />
        </NuqsAdapter>
      </CanvasProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
