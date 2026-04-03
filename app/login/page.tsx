'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, firebaseConfig } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Paintbrush, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user doc exists, if not create it
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
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login com Google não está ativado no Firebase Console. Acesse o console do Firebase e ative o provedor Google em Authentication > Sign-in method.');
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
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // Create user doc in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por E-mail/Senha não está ativado no Firebase Console. Por favor, use o Google Login ou ative o provedor de E-mail no console do Firebase.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Paintbrush className="text-white w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
          </h2>
          <p className="text-slate-500 text-center mb-8">
            {isLogin 
              ? 'Acesse seus orçamentos e agendamentos.' 
              : 'Comece a gerenciar seus serviços de pintura.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              <p>{error}</p>
              {error.includes('Firebase Console') && (
                <a 
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-bold underline text-red-700"
                >
                  Ir para o Console do Firebase →
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              Entrar com Google
            </button>

            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Entre aqui'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
