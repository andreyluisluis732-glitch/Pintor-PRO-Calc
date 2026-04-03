'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '@/constants/catalog';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocFromServer
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
  productId: string;
  color?: string;
  coats: number;
  pricePerM2?: number;
  totalLiters: number;
  packageSize: 'liter' | 'can' | 'bucket';
  packageCount: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  date: string;
  status: 'Finalizado' | 'Aguardando' | 'Cancelado';
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

interface EstimateContextType {
  user: User | null;
  loading: boolean;
  currentEstimate: Partial<Estimate>;
  setCurrentEstimate: (estimate: Partial<Estimate>) => void;
  history: Estimate[];
  appointments: Appointment[];
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
    productId: string; 
    color?: string;
    packageSize: 'liter' | 'can' | 'bucket';
    coats: number; 
    pricePerM2?: number 
  }) => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState<Partial<Estimate>>({});
  const [history, setHistory] = useState<Estimate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore sync
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setAppointments([]);
      return;
    }

    const estimatesQuery = query(collection(db, 'estimates'), where('uid', '==', user.uid));
    const unsubEstimates = onSnapshot(estimatesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
      setHistory(data.sort((a, b) => b.date.localeCompare(a.date)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'estimates');
    });

    const appointmentsQuery = query(collection(db, 'appointments'), where('uid', '==', user.uid));
    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => {
      unsubEstimates();
      unsubAppointments();
    };
  }, [user]);

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'estimates'), {
        ...estimateData,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'estimates');
    }
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
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
    productId: string; 
    color?: string;
    packageSize: 'liter' | 'can' | 'bucket';
    coats: number; 
    pricePerM2?: number 
  }) => {
    const { area, productId, coats, pricePerM2, packageSize, includePaint } = data;
    
    const product = PRODUCT_CATALOG.find(p => p.id === productId) || PRODUCT_CATALOG[0];
    
    const totalLiters = (area * coats) / product.yieldPerLiter;
    
    let packageCount = 0;
    let materialCost = 0;

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

    const laborCost = area * (pricePerM2 || 20);
    const totalCost = includePaint ? (materialCost + laborCost) : laborCost;

    setCurrentEstimate({
      ...data,
      title: `Orçamento - ${data.clientName || 'Sem Nome'}`,
      totalLiters: Math.round(totalLiters * 10) / 10,
      packageCount,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
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
