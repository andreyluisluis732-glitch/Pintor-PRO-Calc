import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Paintbrush, Chrome, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setSetupError(false);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        setSetupError(true);
        setError('O login com Google precisa ser ativado no Console do Firebase.');
      } else {
        setError('Falha ao entrar com Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSetupError(false);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        setSetupError(true);
        setError('O login por E-mail/Senha precisa ser ativado no Console do Firebase.');
      } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-slate-100"
      >
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-10">
            <motion.div 
              whileHover={{ rotate: 5 }}
              className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200"
            >
              <Paintbrush className="text-white w-10 h-10" />
            </motion.div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              {isLogin ? 'Pintor PRO Calc' : 'Criar sua conta'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin 
                ? 'Acesse seus orçamentos e agendamentos profissionais.' 
                : 'Comece a gerenciar seus serviços de pintura com precisão.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {setupError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex gap-3 mb-3">
                    <AlertCircle className="text-amber-600 w-5 h-5 shrink-0" />
                    <h3 className="font-bold text-amber-900 text-sm">Configuração Necessária (Dono do App)</h3>
                  </div>
                  <p className="text-amber-800 text-xs leading-relaxed mb-4">
                    Como dono do aplicativo, você precisa ativar o login no Console do Firebase uma única vez para que seus usuários possam entrar.
                  </p>
                  <a 
                    href={consoleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    Ativar no Console do Firebase
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && !setupError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-slate-100 text-slate-700 font-bold py-4 rounded-2xl shadow-sm hover:border-blue-100 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-4 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              ) : (
                <>
                  <Chrome className="w-6 h-6 text-blue-500" />
                  Entrar com Google
                </>
              )}
            </button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ou e-mail</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {!showEmailForm ? (
              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full py-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                Usar e-mail e senha
                <ChevronDown size={14} />
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full py-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  Ocultar formulário
                  <ChevronUp size={12} />
                </button>
              </motion.form>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se agora' 
                : 'Já tem uma conta? Faça o login'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
