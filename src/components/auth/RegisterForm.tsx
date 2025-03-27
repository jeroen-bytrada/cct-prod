
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegisterFormProps {
  onSubmit: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const RegisterForm = ({ onSubmit, loading, error }: RegisterFormProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(fullName, email, password, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default RegisterForm;
