'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '@/constants/catalog';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

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

interface SupabaseErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

function handleSupabaseError(error: any, operationType: string, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: undefined, // Will be filled if needed
      email: undefined,
    },
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

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
  const [professionalUid, setProfessionalUid] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase sync
  useEffect(() => {
    let estimatesSubscription: any;
    let appointmentsSubscription: any;
    let settingsSubscription: any;

    const fetchData = async () => {
      if (user) {
        // Fetch Estimates
        const { data: estimates, error: estError } = await supabase
          .from('estimates')
          .select('*')
          .eq('uid', user.id)
          .order('created_at', { ascending: false });

        if (estError) handleSupabaseError(estError, 'LIST', 'estimates');
        else setHistory(estimates.map(e => ({
          ...e,
          includePaint: e.include_paint,
          productId: e.product_id,
          pricePerM2: e.price_per_m2,
          fixedPrice: e.fixed_price,
          totalLiters: e.total_liters,
          packageSize: e.package_size,
          packageCount: e.package_count,
          materialCost: e.material_cost,
          laborCost: e.labor_cost,
          totalCost: e.total_cost,
          mediaUrls: e.media_urls
        })));

        // Fetch Appointments
        const { data: appointments, error: appError } = await supabase
          .from('appointments')
          .select('*')
          .eq('uid', user.id);

        if (appError) handleSupabaseError(appError, 'LIST', 'appointments');
        else setAppointments(appointments.map(a => ({
          ...a,
          clientName: a.client_name,
          clientPhone: a.client_phone,
          clientEmail: a.client_email,
          clientAddress: a.client_address
        })));

        // Fetch Settings
        const { data: settings, error: setError } = await supabase
          .from('settings')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (setError && setError.code !== 'PGRST116') {
          handleSupabaseError(setError, 'GET', 'settings');
        } else if (settings) {
          setBusinessPhoneState(settings.business_phone || '');
          setLaborPricePerM2(Number(settings.labor_price_per_m2) || 20);
          if (settings.default_prices) {
            setDefaultPrices(prev => ({ ...prev, ...settings.default_prices }));
          }
          setProfessionalUid(user.id);
        }

        // Real-time subscriptions
        estimatesSubscription = supabase
          .channel('estimates_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'estimates', filter: `uid=eq.${user.id}` }, () => fetchData())
          .subscribe();

        appointmentsSubscription = supabase
          .channel('appointments_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `uid=eq.${user.id}` }, () => fetchData())
          .subscribe();

        settingsSubscription = supabase
          .channel('settings_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `uid=eq.${user.id}` }, () => fetchData())
          .subscribe();
      } else {
        setHistory([]);
        setAppointments([]);
        
        // For guest users, try to find the first settings document
        const { data: settings } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (settings) {
          setBusinessPhoneState(settings.business_phone || '');
          setLaborPricePerM2(Number(settings.labor_price_per_m2) || 20);
          if (settings.default_prices) {
            setDefaultPrices(prev => ({ ...prev, ...settings.default_prices }));
          }
          setProfessionalUid(settings.uid);
        }
      }
    };

    fetchData();

    return () => {
      if (estimatesSubscription) supabase.removeChannel(estimatesSubscription);
      if (appointmentsSubscription) supabase.removeChannel(appointmentsSubscription);
      if (settingsSubscription) supabase.removeChannel(settingsSubscription);
    };
  }, [user]);

  const updateSettings = async (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
  }) => {
    if (!user) return;
    try {
      const updateData: any = {
        uid: user.id,
        updated_at: new Date().toISOString()
      };
      if (settings.businessPhone !== undefined) updateData.business_phone = settings.businessPhone;
      if (settings.laborPricePerM2 !== undefined) updateData.labor_price_per_m2 = settings.laborPricePerM2;
      if (settings.defaultPrices !== undefined) updateData.default_prices = settings.defaultPrices;

      const { error } = await supabase
        .from('settings')
        .upsert(updateData);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `settings/${user.id}`);
    }
  };

  const setBusinessPhone = async (phone: string) => {
    await updateSettings({ businessPhone: phone });
  };

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    try {
      const insertData = {
        uid: user?.id || professionalUid || '00000000-0000-0000-0000-000000000000',
        title: estimateData.title,
        client_name: estimateData.clientName,
        client_phone: estimateData.clientPhone,
        property_type: estimateData.propertyType,
        city: estimateData.city,
        neighborhood: estimateData.neighborhood,
        location: estimateData.location,
        include_paint: estimateData.includePaint,
        area: estimateData.area,
        product_id: estimateData.productId,
        color: estimateData.color,
        coats: estimateData.coats,
        pricing_type: estimateData.pricingType,
        price_per_m2: estimateData.pricePerM2,
        fixed_price: estimateData.fixedPrice,
        total_liters: estimateData.totalLiters,
        package_size: estimateData.packageSize,
        package_count: estimateData.packageCount,
        material_cost: estimateData.materialCost,
        labor_cost: estimateData.laborCost,
        total_cost: estimateData.totalCost,
        date: estimateData.date,
        status: estimateData.status,
        media_urls: estimateData.mediaUrls,
        notes: estimateData.notes
      };

      const { data, error } = await supabase
        .from('estimates')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      handleSupabaseError(error, 'CREATE', 'estimates');
    }
  };

  const getEstimateById = async (id: string): Promise<Estimate | null> => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        return {
          ...data,
          includePaint: data.include_paint,
          productId: data.product_id,
          pricePerM2: data.price_per_m2,
          fixedPrice: data.fixed_price,
          totalLiters: data.total_liters,
          packageSize: data.package_size,
          packageCount: data.package_count,
          materialCost: data.material_cost,
          laborCost: data.labor_cost,
          totalCost: data.total_cost,
          mediaUrls: data.media_urls,
          clientName: data.client_name,
          clientPhone: data.client_phone,
          propertyType: data.property_type
        } as Estimate;
      }
      return null;
    } catch (error) {
      console.error("Error fetching estimate by ID:", error);
      return null;
    }
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    const targetUid = user?.id || professionalUid;
    if (!targetUid) {
      console.error("No target UID for appointment");
      return;
    }
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          uid: targetUid,
          client_name: appointmentData.clientName,
          client_phone: appointmentData.clientPhone,
          client_email: appointmentData.clientEmail,
          client_address: appointmentData.clientAddress,
          notes: appointmentData.notes,
          date: appointmentData.date,
          time: appointmentData.time,
          status: appointmentData.status
        });

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'CREATE', 'appointments');
    }
  };

  const updateAppointment = async (updatedApp: Appointment) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          client_name: updatedApp.clientName,
          client_phone: updatedApp.clientPhone,
          client_email: updatedApp.clientEmail,
          client_address: updatedApp.clientAddress,
          notes: updatedApp.notes,
          date: updatedApp.date,
          time: updatedApp.time,
          status: updatedApp.status
        })
        .eq('id', updatedApp.id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'UPDATE', `appointments/${updatedApp.id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'DELETE', `appointments/${id}`);
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
      // Mão de obra + material: fixedPrice is the TOTAL cost
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
