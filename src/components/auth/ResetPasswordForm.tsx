
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ResetPasswordForm = ({ onSubmit, loading, error }: ResetPasswordFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setValidationError('Wachtwoorden komen niet overeen');
      return;
    }

    if (password.length < 8) {
      setValidationError('Wachtwoord moet minimaal 8 karakters lang zijn');
      return;
    }

    const complexityChecks = [
      { regex: /[A-Z]/, msg: 'Minimaal één hoofdletter vereist' },
      { regex: /[a-z]/, msg: 'Minimaal één kleine letter vereist' },
      { regex: /\d/, msg: 'Minimaal één cijfer vereist' },
      { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, msg: 'Minimaal één speciaal teken vereist' },
    ];

    for (const check of complexityChecks) {
      if (!check.regex.test(password)) {
        setValidationError(check.msg);
        return;
      }
    }
    
    setValidationError(null);
    await onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || validationError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error || validationError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium">
          Nieuw wachtwoord
        </label>
        <Input 
          id="new-password"
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Bevestig nieuw wachtwoord
        </label>
        <Input 
          id="confirm-password"
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Bezig met bijwerken...' : 'Wachtwoord bijwerken'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
