
import React, { useState } from 'react';
import { db } from '../services/database';
import { User } from '../types';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, Loader2, AlertCircle, Terminal } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await db.login(formData.email, formData.password);
      } else {
        user = await db.register(formData.name, formData.email, formData.password);
        // Auto login after register, or ask to login? Let's auto login for UX
        // But register returns user, we need to set session. 
        // Our db.register doesn't set session automatically in this implementation?
        // Let's manually login after register or update db service.
        // Actually for this demo, let's just log them in immediately.
        await db.login(formData.email, formData.password); 
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', 
             backgroundSize: '30px 30px' 
           }}>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0"></div>

      <div className="w-full max-w-md bg-surface border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            SENTINEL<span className="text-primary">FUZZ</span> PRO
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">
            NCIIPC Authorized Access Only
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="analyst@nciipc.gov.in"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg mt-6 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Authenticate' : 'Register Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-xs text-zinc-500 hover:text-primary transition-colors"
            >
              {isLogin ? "Need access? Request registration" : "Already authorized? Back to login"}
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-zinc-900/50 p-4 border-t border-zinc-800 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
            <Shield className="w-3 h-3" />
            <span>Secure Connection • End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
