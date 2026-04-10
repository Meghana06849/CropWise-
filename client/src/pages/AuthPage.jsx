import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/api';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(63,156,83,0.18),_transparent_30%),linear-gradient(180deg,_#f3fbf4_0%,_#eaf5ec_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <motion.div className="flex flex-col justify-center rounded-[2rem] bg-crop-gradient p-8 text-white shadow-glow" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Leaf className="h-6 w-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">CropWise</p>
              <h1 className="text-3xl font-semibold">Real-time crop advisory</h1>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/80">
            Sign in to generate AI-backed crop predictions, save results to MongoDB, and collaborate with other farmers in real time.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Feature icon={<LockKeyhole className="h-4 w-4" />} title="JWT auth" text="Secure login, protected writes, and user-owned records." />
            <Feature icon={<UserRound className="h-4 w-4" />} title="Realtime updates" text="Socket-powered feed refreshes for predictions and community actions." />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
          <Card className="h-full bg-white/95">
            <CardContent>
              <div className="mb-6 flex gap-2 rounded-full bg-crop-50 p-1">
                <button className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'login' ? 'bg-crop-600 text-white' : 'text-slate-600'}`} onClick={() => setMode('login')} type="button">Login</button>
                <button className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${mode === 'register' ? 'bg-crop-600 text-white' : 'text-slate-600'}`} onClick={() => setMode('register')} type="button">Register</button>
              </div>

              <form className="space-y-4" onSubmit={submit}>
                {mode === 'register' ? (
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" required />
                ) : null}
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email" required />
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-10 pr-10" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Password" required />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-crop-50 hover:text-crop-700"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'register' ? (
                  <select className="h-11 w-full rounded-2xl border border-crop-200 bg-white px-4 text-sm" value={form.role} onChange={(e) => update('role', e.target.value)}>
                    <option value="farmer">Farmer</option>
                    <option value="expert">Expert</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : null}

                {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <p className="mt-2 text-xs leading-5 text-white/75">{text}</p>
    </div>
  );
}
