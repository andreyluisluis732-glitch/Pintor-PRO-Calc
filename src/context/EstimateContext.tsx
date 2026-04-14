import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '../constants/catalog';
import { auth, db } from '../lib/firebase';
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
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface LocalUser {
  uid: string;
  displayName: string;
  email: string;
  isLocal: boolean;
}

interface EstimateContextType {
  user: User | LocalUser | null;
  loading: boolean;
  currentEstimate: Partial<Estimate>;
  setCurrentEstimate: (estimate: Partial<Estimate>) => void;
  history: Estimate[];
  appointments: Appointment[];
  businessPhone: string;
  laborPricePerM2: number;
  isPro: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  defaultPrices: Record<PricingType, number>;
  setBusinessPhone: (phone: string) => Promise<void>;
  loginLocally: (name: string) => void;
  logout: () => Promise<void>;
  updateSettings: (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
    isPro?: boolean;
  }) => Promise<void>;
  saveEstimate: (estimate: Omit<Estimate, 'id' | 'uid'>) => Promise<void>;
  saveAppointment: (appointment: Omit<Appointment, 'id' | 'uid'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
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
  const [user, setUser] = useState<User | LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState<Partial<Estimate>>({});
  const [history, setHistory] = useState<Estimate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessPhone, setBusinessPhoneState] = useState<string>('');
  const [laborPricePerM2, setLaborPricePerM2] = useState<number>(20);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

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

  // Load local user on mount
  useEffect(() => {
    const savedLocalUser = localStorage.getItem('localUser');
    if (savedLocalUser) {
      try {
        const parsed = JSON.parse(savedLocalUser);
        setTimeout(() => setUser(parsed), 0);
      } catch (e) {
        console.error("Error parsing local user", e);
      }
    }
  }, []);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // If no firebase user, check if we have a local user
        const savedLocalUser = localStorage.getItem('localUser');
        if (savedLocalUser) {
          setUser(JSON.parse(savedLocalUser));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore sync
  useEffect(() => {
    let unsubEstimates = () => {};
    let unsubAppointments = () => {};
    let unsubSettings = () => {};

    if (user && !('isLocal' in user)) {
      const estimatesQuery = query(collection(db, 'estimates'), where('uid', '==', user.uid));
      unsubEstimates = onSnapshot(estimatesQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
        setHistory(data.sort((a, b) => b.date.localeCompare(a.date)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'estimates');
      });

      const appointmentsQuery = query(collection(db, 'appointments'), where('uid', '==', user.uid));
      unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'appointments');
      });

      unsubSettings = onSnapshot(doc(db, 'settings', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessPhoneState(data.businessPhone || '');
          setLaborPricePerM2(data.laborPricePerM2 || 20);
          setIsPro(!!data.isPro);
          if (data.defaultPrices) {
            setDefaultPrices(prev => ({ ...prev, ...data.defaultPrices }));
          }
          setProfessionalUid(user.uid);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`);
      });
    } else {
      // Load local history and appointments for local users or guests
      const savedHistory = localStorage.getItem('guestHistory');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setTimeout(() => setHistory(parsed), 0);
        } catch (e) {
          console.error("Error parsing local history", e);
        }
      }

      const savedAppointments = localStorage.getItem('guestAppointments');
      if (savedAppointments) {
        try {
          const parsed = JSON.parse(savedAppointments);
          setTimeout(() => setAppointments(parsed), 0);
        } catch (e) {
          console.error("Error parsing local appointments", e);
        }
      }

      // Load from localStorage for guests
      const saved = localStorage.getItem('guestSettings');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setTimeout(() => {
            setBusinessPhoneState(data.businessPhone || '');
            setLaborPricePerM2(data.laborPricePerM2 || 20);
            if (data.defaultPrices) {
              setDefaultPrices(prev => ({ ...prev, ...data.defaultPrices }));
            }
          }, 0);
        } catch (e) {
          console.error("Error parsing guest settings", e);
        }
      }

      // For guest users, try to find the first settings document (the professional's) as fallback
      const settingsQuery = query(collection(db, 'settings'), limit(1));
      unsubSettings = onSnapshot(settingsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setBusinessPhoneState(data.businessPhone || '');
          setLaborPricePerM2(data.laborPricePerM2 || 20);
          setIsPro(!!data.isPro);
          if (data.defaultPrices) {
            setDefaultPrices(prev => ({ ...prev, ...data.defaultPrices }));
          }
          setProfessionalUid(snapshot.docs[0].id);
        }
      }, (error) => {
        console.warn("Could not fetch professional settings for guest:", error);
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
  }) => {
    // Update local state first
    if (settings.businessPhone !== undefined) setBusinessPhoneState(settings.businessPhone);
    if (settings.laborPricePerM2 !== undefined) setLaborPricePerM2(settings.laborPricePerM2);
    if (settings.isPro !== undefined) setIsPro(settings.isPro);
    if (settings.defaultPrices !== undefined) {
      setDefaultPrices(prev => ({ ...prev, ...settings.defaultPrices }));
    }

    // Save to localStorage for guests or local users
    if (!user || ('isLocal' in user)) {
      localStorage.setItem('guestSettings', JSON.stringify({
        businessPhone: settings.businessPhone ?? businessPhone,
        laborPricePerM2: settings.laborPricePerM2 ?? laborPricePerM2,
        defaultPrices: settings.defaultPrices ?? defaultPrices,
        isPro: settings.isPro ?? isPro
      }));
      return;
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

  const loginLocally = (name: string) => {
    const localUser: LocalUser = {
      uid: 'local_' + Math.random().toString(36).substring(2, 11),
      displayName: name,
      email: 'local@device.com',
      isLocal: true
    };
    localStorage.setItem('localUser', JSON.stringify(localUser));
    setUser(localUser);
  };

  const logout = async () => {
    if (user && 'isLocal' in user) {
      localStorage.removeItem('localUser');
      setUser(null);
    } else {
      await auth.signOut();
    }
  };

  const setBusinessPhone = async (phone: string) => {
    await updateSettings({ businessPhone: phone });
  };

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    if (!user || ('isLocal' in user)) {
      const newEstimate: Estimate = {
        ...estimateData,
        id: 'local_' + Date.now(),
        uid: user?.uid || 'guest'
      };
      const updatedHistory = [newEstimate, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('guestHistory', JSON.stringify(updatedHistory));
      return;
    }
    try {
      await addDoc(collection(db, 'estimates'), {
        ...estimateData,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'estimates');
      throw error;
    }
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    if (!user || ('isLocal' in user)) {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: 'local_' + Date.now(),
        uid: user?.uid || 'guest'
      };
      const updatedAppointments = [newAppointment, ...appointments];
      setAppointments(updatedAppointments);
      localStorage.setItem('guestAppointments', JSON.stringify(updatedAppointments));
      return;
    }
    const targetUid = user?.uid || professionalUid;
    if (!targetUid) {
      console.error("No target UID for appointment");
      return;
    }
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
    if (!user || ('isLocal' in user)) {
      const updatedAppointments = appointments.map(app => 
        app.id === updatedApp.id ? updatedApp : app
      );
      setAppointments(updatedAppointments);
      localStorage.setItem('guestAppointments', JSON.stringify(updatedAppointments));
      return;
    }
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
    if (!user || ('isLocal' in user)) {
      const updatedAppointments = appointments.filter(app => app.id !== id);
      setAppointments(updatedAppointments);
      localStorage.setItem('guestAppointments', JSON.stringify(updatedAppointments));
      return;
    }
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
      isPro,
      deferredPrompt,
      defaultPrices,
      setBusinessPhone,
      loginLocally,
      logout,
      updateSettings,
      saveEstimate, 
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
