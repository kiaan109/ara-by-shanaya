'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LogoSVG from '@/components/LogoSVG';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/account');
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const tid = toast.loading('Updating password…');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong', { id: tid });
      } else {
        toast.success('Password updated! You can now sign in.', { id: tid, duration: 4000 });
        if (data.user) {
          localStorage.setItem('ara_user', JSON.stringify(data.user));
          localStorage.setItem('ara_authenticated', '1');
        }
        setDone(true);
        setTimeout(() => router.push('/account'), 2500);
      }
    } catch {
      toast.error('Network error — please try again', { id: tid });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <Link href="/" className="block mb-12 flex justify-center">
          <LogoSVG className="h-12 w-auto" style={{ minWidth: '120px' }} />
        </Link>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#C5A059]/15 flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#C5A059" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-[13px] text-[#767676]">Password updated. Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="text-[11px] tracking-[0.3em] uppercase mb-2">Reset Password</h1>
            <p className="text-[12px] text-[#767676] mb-8">Enter a new password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white text-[11px] tracking-[0.2em] uppercase py-4 hover:opacity-75 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
