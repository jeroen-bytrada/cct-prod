
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    // Clear errors when switching forms
    setError(null);
  }, [isLogin]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginEmail.trim()) {
      setError('E-mailadres is verplicht');
      return;
    }
    
    if (!loginPassword) {
      setError('Wachtwoord is verplicht');
      return;
    }
    
    try {
      setError(null);
      await signIn(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err?.message || 'Inloggen mislukt. Controleer uw gegevens.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Naam moet minimaal 2 tekens bevatten');
      return;
    }
    
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setError('Voer een geldig e-mailadres in');
      return;
    }
    
    if (!registerPassword || registerPassword.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }
    
    try {
      setError(null);
      await signUp(registerEmail, registerPassword, fullName);
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
    // Clear form fields
    setLoginEmail('');
    setLoginPassword('');
    setFullName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
    setError(null);
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <Logo className="w-32 h-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Log in op uw account' : 'Maak een nieuw account'}
        </h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium">
                E-mailadres
              </label>
              <Input 
                id="login-email"
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="uw.email@voorbeeld.nl"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium">
                Wachtwoord
              </label>
              <Input 
                id="login-password"
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm font-medium">
                Volledige naam
              </label>
              <Input 
                id="full-name"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jan Jansen"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium">
                E-mailadres
              </label>
              <Input 
                id="register-email"
                type="email" 
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="uw.email@voorbeeld.nl"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium">
                Wachtwoord
              </label>
              <Input 
                id="register-password"
                type="password" 
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Bevestig wachtwoord
              </label>
              <Input 
                id="confirm-password"
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Account aanmaken...' : 'Account aanmaken'}
            </Button>
          </form>
        )}
        
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={switchForm}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin
              ? "Nog geen account? Registreer nu"
              : 'Heeft u al een account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
