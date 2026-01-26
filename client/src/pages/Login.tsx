import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    window.location.href = '/api/login';
  }, []);

  return (
    <div className="h-full flex items-center justify-center bg-[#1a3c34]">
      <div className="text-white text-center">
        <div className="text-xl mb-2">Redirecting to sign in...</div>
        <div className="text-white/50 text-sm">If you're not redirected, <a href="/api/login" className="underline">click here</a></div>
      </div>
    </div>
  );
}
