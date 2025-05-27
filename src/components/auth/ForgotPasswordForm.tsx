
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLogin: () => void;
  loading: boolean;
  error: string | null;
}

const ForgotPasswordForm = ({ onSubmit, onBackToLogin, loading, error }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="reset-email" className="text-sm font-medium">
          E-mailadres
        </label>
        <Input 
          id="reset-email"
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="uw.email@voorbeeld.nl"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Bezig met verzenden...' : 'Wachtwoord reset e-mail verzenden'}
      </Button>
      
      <Button 
        type="button" 
        variant="ghost" 
        className="w-full" 
        onClick={onBackToLogin}
        disabled={loading}
      >
        Terug naar inloggen
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
