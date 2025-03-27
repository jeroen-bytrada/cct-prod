
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthLayout from './AuthLayout';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
    
    // Clear errors when switching forms
    setError(null);
  }, [isLogin, user, navigate]);

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

  const handleRegisterSubmit = async (
    fullName: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ) => {
    // Basic validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Naam moet minimaal 2 tekens bevatten');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Voer een geldig e-mailadres in');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }
    
    try {
      setError(null);
      await signUp(email, password, fullName);
      toast.success('Registratie succesvol! Controleer uw e-mail voor bevestiging.');
      setIsLogin(true);
    } catch (err: any) {
      console.error('Error signing up:', err);
      // Get more specific error message from Supabase if available
      if (err?.message === 'Signups not allowed for this instance') {
        setError('Registratie is momenteel uitgeschakeld. Neem contact op met de beheerder.');
      } else if (err?.code === 'invalid_credentials') {
        setError('Ongeldige inloggegevens. Probeer het opnieuw.');
      } else {
        setError(err?.message || 'Registratie mislukt. Het e-mailadres is mogelijk al in gebruik.');
      }
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const formTitle = isLogin ? 'Log in op uw account' : 'Maak een nieuw account';
  const formFooter = (
    <button
      type="button"
      onClick={switchForm}
      className="text-sm text-blue-600 hover:underline"
    >
      {isLogin
        ? "Nog geen account? Registreer nu"
        : 'Heeft u al een account? Log in'}
    </button>
  );

  return (
    <AuthLayout title={formTitle} footer={formFooter}>
      {isLogin ? (
        <LoginForm 
          onSubmit={handleLoginSubmit} 
          loading={loading} 
          error={error} 
        />
      ) : (
        <RegisterForm 
          onSubmit={handleRegisterSubmit} 
          loading={loading} 
          error={error} 
        />
      )}
    </AuthLayout>
  );
};

export default AuthContainer;
