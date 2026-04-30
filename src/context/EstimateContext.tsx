import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '../constants/catalog';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc,
  getDocFromServer,
  limit
} from 'firebase/firestore';

export type PropertyType = 'Casa' | 'Apartamento' | 'Prédio' | 'Galpão' | 'Condomínio' | 'Comercial';

export interface Appointment {
  id: string;
  uid: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  notes?: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
}

export type PricingType = 'm2' | 'empreitada' | 'diaria' | 'ambiente' | 'especifico' | 'completo';

export interface Estimate {
  id: string;
  uid: string;
  title: string;
  clientName?: string;
  clientPhone?: string;
  propertyType?: PropertyType;
  city?: string;
  neighborhood?: string;
  location?: string;
  includePaint: boolean;
  area: number;
  productId?: string;
  color?: string;
  coats?: number;
  pricingType: PricingType;
  pricePerM2?: number;
  fixedPrice?: number;
  totalLiters: number;
  packageSize: 'liter' | 'can' | 'bucket';
  packageCount: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  date: string;
  status: 'Finalizado' | 'Aguardando' | 'Cancelado';
  mediaUrls?: string[];
  notes?: string;
  aiPhotoUrl?: string;
  aiPreviewUrl?: string;
  isAiGenerated?: boolean;
}

interface LocalUser {
  uid: string;
  displayName: string;
  email: string;
  isLocal: boolean;
}

interface EstimateContextType {
  user: User | null;
  loading: boolean;
  currentEstimate: Partial<Estimate>;
  setCurrentEstimate: (estimate: Partial<Estimate>) => void;
  history: Estimate[];
  appointments: Appointment[];
  businessPhone: string;
  laborPricePerM2: number;
  isPro: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
  proDaysLeft: number;
  isSubscriptionExpired: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  defaultPrices: Record<PricingType, number>;
  setBusinessPhone: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
    isPro?: boolean;
    subscriptionEndDate?: number;
  }) => Promise<void>;
  saveEstimate: (estimate: Omit<Estimate, 'id' | 'uid'>) => Promise<string | undefined>;
  saveAppointment: (appointment: Omit<Appointment, 'id' | 'uid'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getEstimate: (id: string) => Promise<Estimate | null>;
  calculateEstimate: (data: { 
    clientName?: string; 
    clientPhone?: string;
    propertyType?: PropertyType;
    city?: string;
    neighborhood?: string;
    location?: string;
    includePaint: boolean;
    area: number; 
    productId?: string; 
    color?: string;
    packageSize: 'liter' | 'can' | 'bucket';
    pricingType: PricingType;
    pricePerM2?: number;
    fixedPrice?: number;
    mediaUrls?: string[];
    notes?: string;
  }) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEstimate, setCurrentEstimateState] = useState<Partial<Estimate>>(() => {
    try {
      const saved = sessionStorage.getItem('currentEstimate');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn("Session storage not available or corrupted:", e);
      return {};
    }
  });

  const setCurrentEstimate = (estimate: Partial<Estimate>) => {
    setCurrentEstimateState(estimate);
    try {
      sessionStorage.setItem('currentEstimate', JSON.stringify(estimate));
    } catch (e) {
      console.warn("Session storage write failed:", e);
    }
  };
  const [history, setHistory] = useState<Estimate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessPhone, setBusinessPhoneState] = useState<string>('');
  const [laborPricePerM2, setLaborPricePerM2] = useState<number>(20);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<number | null>(null);
  const [trialStartDate, setTrialStartDate] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const [defaultPrices, setDefaultPrices] = useState<Record<PricingType, number>>({
    m2: 20,
    empreitada: 0,
    diaria: 150,
    ambiente: 300,
    especifico: 0,
    completo: 0
  });
  const [professionalUid, setProfessionalUid] = useState<string | null>(null);
  const [consultantData, setConsultantData] = useState<{
    isPro: boolean;
    subscriptionEndDate: number | null;
    trialStartDate: number | null;
  } | null>(null);

  // Derived Trial Logic
  const trialDaysLeft = React.useMemo(() => {
    const start = consultantData ? consultantData.trialStartDate : trialStartDate;
    if (!start) return 7;
    const diffTime = Math.max(0, now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  }, [trialStartDate, consultantData, now]);

  // Derived Pro Logic
  const proDaysLeft = React.useMemo(() => {
    const end = consultantData ? consultantData.subscriptionEndDate : subscriptionEndDate;
    if (!end) return 0;
    const diffTime = Math.max(0, end - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [subscriptionEndDate, consultantData, now]);

  const hasActiveProSubscription = proDaysLeft > 0;

  const isTrial = hasActiveProSubscription ? false : (trialDaysLeft > 0);
    
  const isSubscriptionExpired = !hasActiveProSubscription && (trialDaysLeft <= 0);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore sync
  useEffect(() => {
    let unsubEstimates = () => {};
    let unsubAppointments = () => {};
    let unsubSettings = () => {};

    const urlParams = new URLSearchParams(window.location.search);
    let consultantIdFromUrl = urlParams.get('consultant');
    const isClientMode = urlParams.get('mode') === 'client';

    if (isClientMode) {
      if (consultantIdFromUrl) {
        sessionStorage.setItem('shared_consultant_id', consultantIdFromUrl);
      } else {
        consultantIdFromUrl = sessionStorage.getItem('shared_consultant_id');
      }
    }

    if (user) {
      const estimatesQuery = query(collection(db, 'estimates'), where('uid', '==', user.uid));
      unsubEstimates = onSnapshot(estimatesQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
        setHistory(data.sort((a, b) => b.date.localeCompare(a.date)));
      }, (error) => {
        console.error('Firestore Error (Estimates): ', error);
      });

      const appointmentsQuery = query(collection(db, 'appointments'), where('uid', '==', user.uid));
      unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(data);
      }, (error) => {
        console.error('Firestore Error (Appointments): ', error);
      });

      unsubSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessPhoneState(data.businessPhone || '');
          setLaborPricePerM2(data.laborPricePerM2 || 20);
          setIsPro(!!data.isPro);
          setSubscriptionEndDate(data.subscriptionEndDate || null);
          setTrialStartDate(data.trialStartDate || null);
          if (data.defaultPrices) {
            setDefaultPrices(prev => ({ ...prev, ...data.defaultPrices }));
          }
          setProfessionalUid(user.uid);
          setConsultantData({
            isPro: !!data.isPro,
            subscriptionEndDate: data.subscriptionEndDate || null,
            trialStartDate: data.trialStartDate || null
          });
        }
      }, (error) => {
         console.error('Firestore Error (Settings): ', error);
      });
    } else if (isClientMode && consultantIdFromUrl) {
      setTimeout(() => setProfessionalUid(consultantIdFromUrl), 0);
      unsubSettings = onSnapshot(doc(db, 'settings', consultantIdFromUrl), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessPhoneState(data.businessPhone || '');
          setLaborPricePerM2(data.laborPricePerM2 || 20);
          if (data.defaultPrices) {
            setDefaultPrices(prev => ({ ...prev, ...data.defaultPrices }));
          }
          setConsultantData({
            isPro: !!data.isPro,
            subscriptionEndDate: data.subscriptionEndDate || null,
            trialStartDate: data.trialStartDate || null
          });
        }
      }, (error) => {
        console.warn("Could not fetch professional settings for client:", error);
      });
    }

    return () => {
      unsubEstimates();
      unsubAppointments();
      unsubSettings();
    };
  }, [user]);

  const updateSettings = async (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
    isPro?: boolean;
    subscriptionEndDate?: number;
  }) => {
    if (!user) return;

    // Update local state first
    if (settings.businessPhone !== undefined) setBusinessPhoneState(settings.businessPhone);
    if (settings.laborPricePerM2 !== undefined) setLaborPricePerM2(settings.laborPricePerM2);
    if (settings.isPro !== undefined) setIsPro(settings.isPro);
    if (settings.subscriptionEndDate !== undefined) setSubscriptionEndDate(settings.subscriptionEndDate);
    if (settings.defaultPrices !== undefined) {
      setDefaultPrices(prev => ({ ...prev, ...settings.defaultPrices }));
    }

    try {
      await setDoc(doc(db, 'settings', user.uid), {
        ...settings,
        uid: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${user.uid}`);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  const setBusinessPhone = async (phone: string) => {
    await updateSettings({ businessPhone: phone });
  };

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    const targetUid = user ? user.uid : professionalUid;
    if (!targetUid) return;

    try {
      const docRef = await addDoc(collection(db, 'estimates'), {
        ...estimateData,
        uid: targetUid,
        isFromClient: !user,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'estimates');
      throw error;
    }
  };

  const getEstimate = async (id: string): Promise<Estimate | null> => {
    const local = history.find(e => e.id === id);
    if (local) return local;

    try {
      const docRef = doc(db, 'estimates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Estimate;
      }
    } catch (err) {
      console.error("Error fetching estimate:", err);
    }
    return null;
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    const targetUid = user ? user.uid : professionalUid;
    if (!targetUid) return;

    try {
      await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        uid: targetUid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
      throw error;
    }
  };

  const updateAppointment = async (updatedApp: Appointment) => {
    if (!user) return;
    try {
      const { id, ...data } = updatedApp;
      await updateDoc(doc(db, 'appointments', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${updatedApp.id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  const calculateEstimate = (data: { 
    clientName?: string; 
    clientPhone?: string;
    propertyType?: PropertyType;
    city?: string;
    neighborhood?: string;
    location?: string;
    includePaint: boolean;
    area: number; 
    productId?: string; 
    color?: string;
    packageSize: 'liter' | 'can' | 'bucket';
    pricingType: PricingType;
    pricePerM2?: number;
    fixedPrice?: number;
    mediaUrls?: string[];
    notes?: string;
  }) => {
    const { area, productId, pricePerM2, fixedPrice, packageSize, includePaint, pricingType } = data;
    const coats = 2; // Default to 2 coats as requested to remove the option
    
    let totalLiters = 0;
    let packageCount = 0;
    let materialCost = 0;

    if (productId) {
      const product = PRODUCT_CATALOG.find(p => p.id === productId) || PRODUCT_CATALOG[0];
      totalLiters = (area * coats) / product.yieldPerLiter;
      
      if (packageSize === 'bucket' && product.pricePerBucket) {
        packageCount = Math.ceil(totalLiters / 18);
        materialCost = packageCount * product.pricePerBucket;
      } else if (packageSize === 'can' && product.pricePerCan) {
        packageCount = Math.ceil(totalLiters / 3.6);
        materialCost = packageCount * product.pricePerCan;
      } else {
        packageCount = Math.ceil(totalLiters);
        materialCost = packageCount * product.pricePerLiter;
      }
    }

    let laborCost = 0;
    const finalPricePerM2 = pricePerM2 || laborPricePerM2 || 20;

    if (pricingType === 'm2') {
      laborCost = area * finalPricePerM2;
    } else if (pricingType === 'completo') {
      // Mão de obra + material (already handled by includePaint logic, but let's assume fixedPrice is the labor part)
      laborCost = fixedPrice || defaultPrices.completo || 0;
    } else {
      laborCost = fixedPrice || defaultPrices[pricingType] || 0;
    }

    const finalMaterialCost = includePaint ? Math.round(materialCost) : 0;
    const totalCost = Math.round(finalMaterialCost + laborCost);

    setCurrentEstimate({
      ...data,
      pricePerM2: pricingType === 'm2' ? finalPricePerM2 : undefined,
      title: `Orçamento - ${data.clientName || 'Sem Nome'}`,
      totalLiters: Math.round(totalLiters * 10) / 10,
      packageCount,
      materialCost: finalMaterialCost,
      laborCost: Math.round(laborCost),
      totalCost,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      status: 'Aguardando'
    });
  };

  return (
    <EstimateContext.Provider value={{ 
      user,
      loading,
      currentEstimate, 
      setCurrentEstimate, 
      history, 
      appointments,
      businessPhone,
      laborPricePerM2,
      isPro: hasActiveProSubscription,
      isTrial,
      trialDaysLeft,
      proDaysLeft,
      isSubscriptionExpired,
      deferredPrompt,
      defaultPrices,
      setBusinessPhone,
      logout,
      updateSettings,
      saveEstimate, 
      getEstimate,
      saveAppointment,
      updateAppointment,
      deleteAppointment,
      calculateEstimate 
    }}>
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate() {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
}
