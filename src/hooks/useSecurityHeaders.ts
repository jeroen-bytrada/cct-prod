import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set security-related meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Content Security Policy
    setMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://qvrxmdmnefwtyvhubsnf.supabase.co; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://qvrxmdmnefwtyvhubsnf.supabase.co wss://qvrxmdmnefwtyvhubsnf.supabase.co; " +
      "font-src 'self' data:; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self';"
    );

    // X-Frame-Options
    setMetaTag('X-Frame-Options', 'DENY');

    // X-Content-Type-Options
    setMetaTag('X-Content-Type-Options', 'nosniff');

    // Referrer Policy
    setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    setMetaTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
  }, []);
};