import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { useEstimate } from '../context/EstimateContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
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
import { Mail, Lock, User, ArrowRight, Loader2, Paintbrush, Chrome, AlertCircle, ExternalLink, Database } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [tempUser, setTempUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);
  
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

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    return true;
  };

  const checkCpfUsage = async (cpfValue: string) => {
    const cleanCpf = cpfValue.replace(/\D/g, '');
    try {
      const docRef = doc(db, 'cpfs', cleanCpf);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `cpfs/${cleanCpf}`);
      return false;
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    // We only auto-navigate if it's NOT a login in progress that still needs CPF check
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !loading) {
        // Double check if user has a CPF in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
             navigate('/');
          } else if (user.providerData[0]?.providerId === 'google.com') {
             // If Google user and no doc, they need to fill CPF modal
             setTempUser({
               uid: user.uid,
               email: user.email,
               displayName: user.displayName,
             });
             setShowCpfModal(true);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
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
        // New Google user: need CPF
        setTempUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
        setShowCpfModal(true);
        setLoading(false);
        return;
      }
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/operation-not-allowed') {
        setSetupError(true);
        setError('O login com Google precisa ser ativado no Console do Firebase.');
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        setError('Este domínio não está autorizado no Firebase. Adicione o domínio do app nas configurações de Autenticação.');
      } else {
        setError(`Erro: ${firebaseError.code || 'Falha ao entrar com Google'}. Verifique o console.`);
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
        // Try local login first
        // Removed local login check
        
        if (!validateCPF(cpf)) {
          setError('CPF inválido. Use o formato 000.000.000-00');
          setLoading(false);
          return;
        }

        // 1. Sign in first (getting authentication is required to read own user doc)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Read own user doc
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setError('Dados do usuário não encontrados.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const cleanCpfInput = cpf.replace(/\D/g, '');

        if (userData.cpf !== cleanCpfInput) {
          setError('O CPF informado não confere com o cadastrado para esta conta.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        // Success - navigation handled by useEffect or here
        navigate('/');
      } else {
        // Registration: Validate CPF
        if (!validateCPF(cpf)) {
          setError('CPF inválido. Use o formato 000.000.000-00');
          setLoading(false);
          return;
        }

        const cpfInUse = await checkCpfUsage(cpf);
        if (cpfInUse) {
          setError('Este CPF já foi utilizado para iniciar um período de teste de 7 dias.');
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
          phone: phone.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''), // Store clean CPF
          role: 'user',
          isTrial: true,
          trialStartDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Also create an initial settings doc with the same phone and trial info
        await setDoc(doc(db, 'settings', user.uid), {
          uid: user.uid,
          businessPhone: phone.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''),
          laborPricePerM2: 0,
          trialStartDate: Date.now(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        // Track CPF usage for trials
        await setDoc(doc(db, 'cpfs', cpf.replace(/\D/g, '')), {
          uid: user.uid,
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

  const handleFinalizeGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    
    setError('');
    setLoading(true);

    try {
      if (!validateCPF(cpf)) {
        setError('CPF inválido.');
        setLoading(false);
        return;
      }

      const cpfInUse = await checkCpfUsage(cpf);
      if (cpfInUse) {
        setError('Este CPF já foi utilizado para iniciar um período de teste de 7 dias.');
        setLoading(false);
        return;
      }

      const cleanCpf = cpf.replace(/\D/g, '');

      await setDoc(doc(db, 'users', tempUser.uid), {
        uid: tempUser.uid,
        email: tempUser.email,
        displayName: tempUser.displayName,
        cpf: cleanCpf,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Track CPF usage for trials
      await setDoc(doc(db, 'cpfs', cleanCpf), {
        uid: tempUser.uid,
        createdAt: serverTimestamp()
      });
      
      setShowCpfModal(false);
      navigate('/');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.WRITE, `users/${tempUser.uid}`);
      setError('Erro ao salvar CPF. Tente novamente.');
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
              {isLogin ? 'Pintor PRO Calc' : 'Modo Teste Grátis'}
            </h2>
            
            {isLogin ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                <p className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">Plano Profissional</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-slate-500 line-through text-xs">R$ 97,00</span>
                  <span className="text-blue-600 font-black text-xl">R$ 50,00</span>
                  <span className="text-slate-500 text-xs">/mês</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Pix ou Cartão de Crédito</p>
              </div>
            ) : (
              <p className="text-slate-500 font-bold text-sm px-6 leading-relaxed">
                É a sua primeira vez usando o Pintor PRO Calc? Entre no modo teste para obter 7 dias utilizando o app gratuito!
              </p>
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

            {showCpfModal && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Quase lá!</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Para aproveitar os 7 dias grátis, informe seu CPF. Isso evita que o mesmo usuário use várias contas.
                  </p>
                  <form onSubmit={handleFinalizeGoogleRegistration} className="space-y-4">
                    <div className="relative">
                      <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Seu CPF"
                        value={cpf}
                        onChange={handleCpfChange}
                        required
                        maxLength={14}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                      />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Cadastro'}
                    </button>
                  </form>
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
              {isLogin && (
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Seu CPF (000.000.000-00)"
                    value={cpf}
                    onChange={handleCpfChange}
                    required
                    maxLength={14}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                  />
                </div>
              )}

              {!isLogin && (
                <>
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
                      type="tel"
                      placeholder="WhatsApp / Telefone"
                      value={phone}
                      onChange={handlePhoneChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="CPF (000.000.000-00)"
                      value={cpf}
                      onChange={handleCpfChange}
                      required
                      maxLength={14}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                    />
                  </div>
                </>
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
                    {isLogin ? 'Entrar com E-mail' : 'Criar Conta com E-mail'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ou continuar com</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

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
                  Google
                </>
              )}
            </button>
          </div>

            <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 w-full active:scale-[0.98]"
              >
                {isLogin 
                  ? 'Iniciar MODO TESTE (7 Dias Grátis)' 
                  : 'Já tenho uma conta / Fazer Login'}
              </button>

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
