import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';
import { UserStateProvider } from '../state/UserStateProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ToastProvider } from '../toast/ToastProvider';
import { queryClient } from './queryClient';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <UserStateProvider>
              <RouterProvider router={router} />
            </UserStateProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
