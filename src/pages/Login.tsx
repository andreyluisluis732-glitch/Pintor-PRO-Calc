import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { useEstimate } from '../context/EstimateContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Paintbrush, AlertCircle, ExternalLink, Check } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const validateCPF = (cpfValue: string) => {
    const cleanCPF = cpfValue.replace(/\D/g, '');
    return cleanCPF.length === 11;
  };
  const [setupError, setSetupError] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Only handle auto-navigation if we have a full user record
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !loading) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
             navigate('/');
          }
          // Note: We removed the auto-trigger of setShowCpfModal here 
          // to let the user see the full login form if they prefer.
        } catch (e) {
          console.warn("Auth check failed:", e);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, loading]);

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSetupError(false);
    setLoading(true);

    try {
      if (isLogin) {
        // 1. Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user exists in our database
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setError('Dados do usuário não encontrados.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        // Success
        navigate('/');
      } else {
        // Registration validations
        if (!name || name.trim().length < 3) {
          setError('Informe seu nome completo.');
          setLoading(false);
          return;
        }

        if (!validateCPF(cpf)) {
          setError('CPF inválido.');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('As senhas não conferem.');
          setLoading(false);
          return;
        }

        if (!termsAccepted) {
          setError('Você precisa aceitar os termos de uso.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          cpf: cpf.replace(/\D/g, ''),
          role: 'user',
          isTrial: true,
          trialStartDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Also create an initial settings doc with basic info
        await setDoc(doc(db, 'settings', user.uid), {
          uid: user.uid,
          businessPhone: '',
          cpf: cpf.replace(/\D/g, ''),
          laborPricePerM2: 0,
          trialStartDate: Date.now(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        setSetupError(true);
        setError('O login por E-mail/Senha precisa ser ativado no Console do Firebase.');
      } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado no Firebase.');
      } else {
        setError(`Erro: ${firebaseError.code || 'Ocorreu um erro'}.`);
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
              {isLogin ? 'Login Profissional' : 'Modo Teste Grátis'}
            </h2>
            
            {isLogin ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4 text-center">
                <p className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">Acesso do Profissional</p>
                <p className="text-slate-600 text-sm font-medium italic">"A excelência na pintura começa com um bom orçamento."</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 text-center">
                <p className="text-green-800 text-xs font-bold uppercase tracking-wider mb-2">7 Dias Totalmente Grátis</p>
                <p className="text-slate-600 text-sm font-medium">Cadastre-se para iniciar seu período de testes.</p>
              </div>
            )}
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
                  <div className="space-y-2">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {error && !setupError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl space-y-2"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
                {error.includes('auth/') && (
                  <div className="mt-2 pt-2 border-t border-red-100 text-[10px] text-red-400 leading-relaxed uppercase tracking-wider font-bold">
                    Dica: Verifique se o login foi ativado no Console do Firebase e se o domínio está autorizado.
                  </div>
                )}
              </motion.div>
            )}

          <div className="space-y-6">
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Seu E-mail"
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
                  placeholder={isLogin ? "Sua Senha" : "Crie uma senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                />
              </div>

              {!isLogin && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="password"
                      placeholder="Confirmar a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>

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

                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Seu CPF"
                      value={cpf}
                      onChange={handleCpfChange}
                      required
                      maxLength={14}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        />
                        <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-tight">
                        Eu concordo com os termos de uso e política de privacidade
                      </span>
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'ENTRAR NO APP' : 'CADASTRAR E INICIAR TESTE'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          </div>

            <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-6">
              <button
                onClick={() => {
                  setError('');
                  setIsLogin(!isLogin);
                }}
                className="bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 w-full active:scale-[0.98] group"
              >
                {isLogin 
                  ? 'CONTA DE TESTE GRATUITO' 
                  : 'Fazer Login Profissional'}
              </button>

              {isLogin && (
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  clique aqui para vc poder ultilizar o modo teste durante 7 dias  gratuito
                </p>
              )}

              <div className="pt-4 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planos Profissionais</p>
                <Link 
                  to="/vendas"
                  className="block w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
                >
                  Ver Assinaturas e Pagamentos
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] text-center text-slate-400 mt-1 uppercase tracking-widest font-bold">
                  Acesso Seguro • Sem Cartão de Crédito no Teste
                </p>
              </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
