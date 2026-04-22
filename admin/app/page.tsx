'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('admin@arabyshanaya.com');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('ara_admin_token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Enter your email and password'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('ara_admin_token', data.token);
      localStorage.setItem('ara_admin_user',  JSON.stringify(data.admin));
      toast.success(`Welcome back, ${data.admin.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif tracking-widest text-black">ARA</h1>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-sm font-medium tracking-widest uppercase text-gray-900 mb-8 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                placeholder="admin@arabyshanaya.com"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-black transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-[10px] mt-6 tracking-wider">
          ARA by Shanaya © 2025
        </p>
      </div>
    </div>
  );
}
