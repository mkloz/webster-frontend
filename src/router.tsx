import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { App } from './app';
import { AuthLayout } from './modules/auth/layout/auth-layout';
import { ActivateAccountPage } from './modules/auth/pages/activate-account-page';
import { ForgotPasswordPage } from './modules/auth/pages/forgot-password-page';
import { LoginPage } from './modules/auth/pages/login-page';
import { ResetPasswordPage } from './modules/auth/pages/reset-password-page';
import { SignUpPage } from './modules/auth/pages/sign-up-page';
import { HomePage } from './modules/home/pages/home-page';
import { SharedImagePage } from './modules/shared/pages/shared-image-page';
import { NotFound } from './shared/pages/not-found';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'activate/:token',
            element: <ActivateAccountPage />
          },
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'sign-up',
            element: <SignUpPage />
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
          },
          {
            path: 'reset-password/:token',
            element: <ResetPasswordPage />
          }
        ]
      },
      {
        path: 'shared/:url',
        element: <SharedImagePage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
