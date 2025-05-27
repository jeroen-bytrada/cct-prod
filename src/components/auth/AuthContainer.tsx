
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import AuthLayout from './AuthLayout';

type AuthMode = 'login' | 'forgot' | 'reset';

const AuthContainer = () => {
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [searchParams] = useSearchParams();
  const { signIn, resetPassword, updatePassword, user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we're in password reset mode
    if (searchParams.get('reset') === 'true') {
      setMode('reset');
    }
    
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
    
    // Clear errors when component loads or mode changes
    setError(null);
  }, [user, navigate, searchParams, mode]);

  const handleLoginSubmit = async (email: string, password: string) => {
    // Basic validation
    if (!email.trim()) {
      setError('E-mailadres is verplicht');
      return;
    }
    
    if (!password) {
      setError('Wachtwoord is verplicht');
      return;
    }
    
    try {
      setError(null);
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err?.message || 'Inloggen mislukt. Controleer uw gegevens.');
    }
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    if (!email.trim()) {
      setError('E-mailadres is verplicht');
      return;
    }
    
    try {
      setError(null);
      await resetPassword(email);
      // Show success and switch back to login
      setMode('login');
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het verzenden van de reset e-mail.');
    }
  };

  const handleResetPasswordSubmit = async (password: string) => {
    try {
      setError(null);
      await updatePassword(password);
      navigate('/');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het bijwerken van het wachtwoord.');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'forgot':
        return 'Wachtwoord vergeten';
      case 'reset':
        return 'Nieuw wachtwoord instellen';
      default:
        return 'Log in op uw account';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'forgot':
        return (
          <ForgotPasswordForm 
            onSubmit={handleForgotPasswordSubmit}
            onBackToLogin={() => setMode('login')}
            loading={loading}
            error={error}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onSubmit={handleResetPasswordSubmit}
            loading={loading}
            error={error}
          />
        );
      default:
        return (
          <LoginForm 
            onSubmit={handleLoginSubmit}
            onForgotPassword={() => setMode('forgot')}
            loading={loading}
            error={error}
          />
        );
    }
  };

  return (
    <AuthLayout title={getTitle()} footer={null}>
      {renderForm()}
    </AuthLayout>
  );
};

export default AuthContainer;
