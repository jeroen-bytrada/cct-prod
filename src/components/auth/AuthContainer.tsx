
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoginForm from './LoginForm';
import AuthLayout from './AuthLayout';

const AuthContainer = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
    
    // Clear errors when component loads
    setError(null);
  }, [user, navigate]);

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

  const formTitle = 'Log in op uw account';

  return (
    <AuthLayout title={formTitle} footer={null}>
      <LoginForm 
        onSubmit={handleLoginSubmit} 
        loading={loading} 
        error={error} 
      />
    </AuthLayout>
  );
};

export default AuthContainer;
