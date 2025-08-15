import { useState } from 'react';

interface PasswordValidation {
  isValid: boolean;
  score: number;
  feedback: string[];
}

export const usePasswordValidation = () => {
  const [validation, setValidation] = useState<PasswordValidation>({
    isValid: false,
    score: 0,
    feedback: []
  });

  const validatePassword = (password: string): PasswordValidation => {
    const feedback: string[] = [];
    let score = 0;

    // Minimum length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    const result = {
      isValid: feedback.length === 0,
      score: Math.min(score, 5),
      feedback
    };

    setValidation(result);
    return result;
  };

  return {
    validation,
    validatePassword
  };
};