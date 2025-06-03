import { Navigate, useParams } from 'react-router-dom';

import { ResetPasswordForm } from '../components/form/reset-password-form';

export const ResetPasswordPage = () => {
  const { token } = useParams();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <ResetPasswordForm token={token} />;
};
