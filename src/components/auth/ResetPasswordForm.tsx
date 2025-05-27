
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
    
    if (password.length < 6) {
      setValidationError('Wachtwoord moet minimaal 6 karakters lang zijn');
      return;
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
          minLength={6}
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
          minLength={6}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Bezig met bijwerken...' : 'Wachtwoord bijwerken'}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
