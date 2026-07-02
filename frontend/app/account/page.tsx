'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoSVG from '@/components/LogoSVG';

type User = { name: string; email: string; phone?: string };

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      // Only restore session from a real login — not from popup/checkout pre-fill
      if (localStorage.getItem('ara_authenticated') === '1') {
        const stored = localStorage.getItem('ara_user');
        if (stored) setUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: any = { action: tab, email, password };
      if (tab === 'register') body.name = name;
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        localStorage.setItem('ara_user', JSON.stringify(data.user));
        localStorage.setItem('ara_authenticated', '1');
        setUser(data.user);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('ara_authenticated');
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: image (desktop) */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        <img
          src="/products/minty-green-dress-1.jpg"
          alt="ARA by Shanaya"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>

      {/* Right: form or dashboard */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 md:px-16 py-16">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link href="/" className="block mb-12 flex justify-center">
            <LogoSVG className="h-12 w-auto" style={{ minWidth: '120px' }} />
          </Link>

          {user ? (
            /* ── Logged-in dashboard ── */
            <div className="space-y-8">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#767676] mb-1">Welcome back</p>
                <p className="text-xl font-light text-[#1a1c1c]">{user.name}</p>
                <p className="text-[12px] text-[#767676] mt-1">{user.email}</p>
              </div>

              <div className="space-y-3">
                <Link href="/orders"
                  className="flex items-center justify-between w-full border border-[#e5e5e5] px-5 py-4 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-all">
                  <span>My Orders</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/wishlist"
                  className="flex items-center justify-between w-full border border-[#e5e5e5] px-5 py-4 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-all">
                  <span>Wishlist</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <button onClick={handleLogout}
                className="w-full border border-[#e5e5e5] text-[#767676] text-[11px] tracking-[0.2em] uppercase py-4 hover:border-black hover:text-black transition-all">
                Sign Out
              </button>
            </div>
          ) : (
            /* ── Auth forms ── */
            <>
              {/* Tabs */}
              <div className="flex border-b border-[#e5e5e5] mb-10">
                {(['login', 'register'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 pb-3 text-[11px] tracking-[0.2em] uppercase transition-all ${
                      tab === t ? 'border-b-2 border-black text-black -mb-px' : 'text-[#767676] hover:text-black'
                    }`}>
                    {t === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mb-6 text-[12px] text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {tab === 'register' && (
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                      placeholder="Your name"
                      className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com"
                    className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder={tab === 'register' ? 'Create a password' : '••••••••'}
                    className="w-full border-0 border-b border-[#e5e5e5] focus:border-black focus:outline-none py-3 text-[13px] bg-transparent placeholder:text-[#ccc] transition-colors" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-black text-white text-[11px] tracking-[0.2em] uppercase py-4 hover:opacity-75 transition-opacity disabled:opacity-50">
                  {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
                {tab === 'login' && (
                  <p className="text-center text-[11px] text-[#767676]">
                    <button type="button" className="hover:text-black transition-colors underline underline-offset-2">
                      Forgot Password?
                    </button>
                  </p>
                )}
              </form>

              <div className="mt-10 pt-8 border-t border-[#e5e5e5] text-center">
                <p className="text-[11px] text-[#767676] mb-4">Or contact us directly</p>
                <a href="https://wa.me/918980008826?text=Hi%21%20I%27d%20like%20to%20get%20help%20with%20my%20ARA%20order."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-[#e5e5e5] py-3.5 text-[11px] tracking-[0.15em] uppercase hover:border-black transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
