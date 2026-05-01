import { useState } from 'react';
import { Scissors, Eye, EyeOff } from 'lucide-react';

type Mode = 'login' | 'signup' | 'forgot';

interface Props {
  onLogin: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
}

function PasswordInput({
  value,
  onChange,
  placeholder = '••••••',
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function Login({ onLogin, onSignUp, onResetPassword }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = (next: Mode) => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setMode(next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    const err = await onLogin(email, password);
    if (err) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await onSignUp(email, password);
    setLoading(false);
    if (err) {
      setError('Não foi possível criar a conta. Tente novamente.');
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const err = await onResetPassword(email);
    setLoading(false);
    if (err) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço.');
    } else {
      setSuccess('E-mail enviado! Verifique sua caixa de entrada para redefinir a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-600/20 border border-yellow-600/40 mb-4">
            <Scissors size={28} className="text-yellow-500" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">LevelzCut</h1>
          <p className="text-gray-500 text-sm mt-1">Área do Barbeiro</p>
        </div>

        {/* Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoCapitalize="none"
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Senha</label>
              <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => resetForm('forgot')}
              className="w-full text-center text-sm text-gray-500 hover:text-yellow-500 transition-colors py-1"
            >
              Esqueci minha senha
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600">ou</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <button
              type="button"
              onClick={() => resetForm('signup')}
              className="w-full border border-yellow-600/50 hover:border-yellow-500 text-yellow-500 hover:text-yellow-400 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Criar nova conta
            </button>
          </form>
        )}

        {/* Cadastro */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoCapitalize="none"
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Senha</label>
              <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">Confirmar senha</label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg py-2 px-3">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-400 text-sm text-center bg-green-900/20 border border-green-800 rounded-lg py-2 px-3">
                {success}
              </p>
            )}

            {!success && (
              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Criando conta…' : 'Criar conta'}
              </button>
            )}

            <p className="text-center text-sm text-gray-500 pt-1">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => resetForm('login')}
                className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
              >
                Entrar
              </button>
            </p>
          </form>
        )}

        {/* Esqueci a senha */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-gray-400 text-sm text-center mb-2">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoCapitalize="none"
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg py-2 px-3">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-400 text-sm text-center bg-green-900/20 border border-green-800 rounded-lg py-2 px-3">
                {success}
              </p>
            )}

            {!success && (
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Enviando…' : 'Enviar link'}
              </button>
            )}

            <p className="text-center text-sm text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => resetForm('login')}
                className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
              >
                Voltar ao login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
