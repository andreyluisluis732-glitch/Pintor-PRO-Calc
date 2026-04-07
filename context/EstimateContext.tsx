'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '@/constants/catalog';

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
  coats: number;
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

// Mock User type to maintain compatibility
export interface User {
  id: string;
  email?: string;
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
  defaultPrices: Record<PricingType, number>;
  setBusinessPhone: (phone: string) => Promise<void>;
  updateSettings: (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
  }) => Promise<void>;
  saveEstimate: (estimate: Omit<Estimate, 'id' | 'uid'>) => Promise<string | undefined>;
  getEstimateById: (id: string) => Promise<Estimate | null>;
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
    coats: number; 
    pricingType: PricingType;
    pricePerM2?: number;
    fixedPrice?: number;
    mediaUrls?: string[];
    notes?: string;
  }) => void;
  login: (email: string) => void;
  logout: () => void;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ESTIMATES: 'pintor_pro_estimates',
  APPOINTMENTS: 'pintor_pro_appointments',
  SETTINGS: 'pintor_pro_settings',
  USER: 'pintor_pro_user'
};

export function EstimateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEstimate, setCurrentEstimate] = useState<Partial<Estimate>>({});
  const [history, setHistory] = useState<Estimate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessPhone, setBusinessPhoneState] = useState<string>('');
  const [laborPricePerM2, setLaborPricePerM2] = useState<number>(20);
  const [defaultPrices, setDefaultPrices] = useState<Record<PricingType, number>>({
    m2: 20,
    empreitada: 0,
    diaria: 150,
    ambiente: 300,
    especifico: 0,
    completo: 0
  });

  // Load initial data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedEstimates = localStorage.getItem(STORAGE_KEYS.ESTIMATES);
    if (storedEstimates) {
      setHistory(JSON.parse(storedEstimates));
    }

    const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }

    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setBusinessPhoneState(settings.businessPhone || '');
      setLaborPricePerM2(settings.laborPricePerM2 || 20);
      if (settings.defaultPrices) {
        setDefaultPrices(prev => ({ ...prev, ...settings.defaultPrices }));
      }
    }

    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser = { id: 'local-user', email };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const updateSettings = async (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
  }) => {
    const newSettings = {
      businessPhone: settings.businessPhone !== undefined ? settings.businessPhone : businessPhone,
      laborPricePerM2: settings.laborPricePerM2 !== undefined ? settings.laborPricePerM2 : laborPricePerM2,
      defaultPrices: settings.defaultPrices !== undefined ? { ...defaultPrices, ...settings.defaultPrices } : defaultPrices
    };

    if (settings.businessPhone !== undefined) setBusinessPhoneState(settings.businessPhone);
    if (settings.laborPricePerM2 !== undefined) setLaborPricePerM2(settings.laborPricePerM2);
    if (settings.defaultPrices !== undefined) setDefaultPrices(prev => ({ ...prev, ...settings.defaultPrices }));

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  };

  const setBusinessPhone = async (phone: string) => {
    await updateSettings({ businessPhone: phone });
  };

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    const newEstimate: Estimate = {
      ...estimateData,
      id: Math.random().toString(36).substr(2, 9),
      uid: user?.id || 'local-user'
    };

    const newHistory = [newEstimate, ...history];
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(newHistory));
    return newEstimate.id;
  };

  const getEstimateById = async (id: string): Promise<Estimate | null> => {
    const estimate = history.find(e => e.id === id);
    return estimate || null;
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.random().toString(36).substr(2, 9),
      uid: user?.id || 'local-user'
    };

    const newAppointments = [newAppointment, ...appointments];
    setAppointments(newAppointments);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(newAppointments));
  };

  const updateAppointment = async (updatedApp: Appointment) => {
    const newAppointments = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
    setAppointments(newAppointments);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(newAppointments));
  };

  const deleteAppointment = async (id: string) => {
    const newAppointments = appointments.filter(a => a.id !== id);
    setAppointments(newAppointments);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(newAppointments));
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
    coats: number; 
    pricingType: PricingType;
    pricePerM2?: number;
    fixedPrice?: number;
    mediaUrls?: string[];
    notes?: string;
  }) => {
    const { area, productId, coats, pricePerM2, fixedPrice, packageSize, includePaint, pricingType } = data;
    
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
    let finalPricePerM2 = pricePerM2 || laborPricePerM2 || 20;

    if (pricingType === 'm2') {
      laborCost = area * finalPricePerM2;
    } else if (pricingType === 'completo') {
      const total = fixedPrice || defaultPrices.completo || 0;
      laborCost = Math.max(0, total - (includePaint ? materialCost : 0));
    } else {
      laborCost = fixedPrice || defaultPrices[pricingType] || 0;
    }

    const totalCost = (includePaint ? materialCost : 0) + laborCost;

    setCurrentEstimate({
      ...data,
      pricePerM2: pricingType === 'm2' ? finalPricePerM2 : undefined,
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
      businessPhone,
      laborPricePerM2,
      defaultPrices,
      setBusinessPhone,
      updateSettings,
      saveEstimate, 
      getEstimateById,
      saveAppointment,
      updateAppointment,
      deleteAppointment,
      calculateEstimate,
      login,
      logout
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
