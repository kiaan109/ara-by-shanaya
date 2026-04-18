'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { login } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (localStorage.getItem('ara_admin_token')) router.replace('/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('ara_admin_token', data.token);
      localStorage.setItem('ara_admin_user',  JSON.stringify(data.admin));
      toast.success(`Welcome, ${data.admin.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-[0.2em] text-white mb-2">ARA</h1>
          <p className="text-gold-500/60 text-xs tracking-[0.4em] uppercase">Admin Portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-luxury-card border border-gold-500/20 rounded-lg p-8 space-y-6"
        >
          <h2 className="text-white text-xl text-center mb-2">Sign In</h2>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@arabyshanaya.com"
              className="w-full bg-luxury-dark border border-gold-500/20 px-4 py-3 text-sm text-white placeholder-gray-700 rounded-sm focus:outline-none focus:border-gold-500/60"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-luxury-dark border border-gold-500/20 px-4 py-3 text-sm text-white placeholder-gray-700 rounded-sm focus:outline-none focus:border-gold-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 text-black font-semibold py-3 rounded-sm text-sm tracking-[0.2em] uppercase hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-700 text-xs mt-6">
          Default: admin@arabyshanaya.com / Admin@1234
        </p>
      </motion.div>
    </div>
  );
}
