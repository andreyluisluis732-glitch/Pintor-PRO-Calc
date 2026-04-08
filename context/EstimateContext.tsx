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
  logout: () => Promise<void>;
}

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

// Helper to map DB snake_case to CamelCase
const mapDBToEstimate = (db: any): Estimate => ({
  id: db.id,
  uid: db.uid,
  title: db.title,
  clientName: db.client_name,
  clientPhone: db.client_phone,
  propertyType: db.property_type,
  city: db.city,
  neighborhood: db.neighborhood,
  location: db.location,
  includePaint: db.include_paint,
  area: db.area,
  productId: db.product_id,
  color: db.color,
  coats: db.coats,
  pricingType: db.pricing_type,
  pricePerM2: db.price_per_m2,
  fixedPrice: db.fixed_price,
  totalLiters: db.total_liters,
  packageSize: db.package_size,
  packageCount: db.package_count,
  materialCost: db.material_cost,
  laborCost: db.labor_cost,
  totalCost: db.total_cost,
  date: db.date,
  status: db.status,
  mediaUrls: db.media_urls,
  notes: db.notes,
});

const mapEstimateToDB = (est: Partial<Estimate>) => {
  const db: any = {};
  if (est.title !== undefined) db.title = est.title;
  if (est.clientName !== undefined) db.client_name = est.clientName;
  if (est.clientPhone !== undefined) db.client_phone = est.clientPhone;
  if (est.propertyType !== undefined) db.property_type = est.propertyType;
  if (est.city !== undefined) db.city = est.city;
  if (est.neighborhood !== undefined) db.neighborhood = est.neighborhood;
  if (est.location !== undefined) db.location = est.location;
  if (est.includePaint !== undefined) db.include_paint = est.includePaint;
  if (est.area !== undefined) db.area = est.area;
  if (est.productId !== undefined) db.product_id = est.productId;
  if (est.color !== undefined) db.color = est.color;
  if (est.coats !== undefined) db.coats = est.coats;
  if (est.pricingType !== undefined) db.pricing_type = est.pricingType;
  if (est.pricePerM2 !== undefined) db.price_per_m2 = est.pricePerM2;
  if (est.fixedPrice !== undefined) db.fixed_price = est.fixedPrice;
  if (est.totalLiters !== undefined) db.total_liters = est.totalLiters;
  if (est.packageSize !== undefined) db.package_size = est.packageSize;
  if (est.packageCount !== undefined) db.package_count = est.packageCount;
  if (est.materialCost !== undefined) db.material_cost = est.materialCost;
  if (est.laborCost !== undefined) db.labor_cost = est.laborCost;
  if (est.totalCost !== undefined) db.total_cost = est.totalCost;
  if (est.date !== undefined) db.date = est.date;
  if (est.status !== undefined) db.status = est.status;
  if (est.mediaUrls !== undefined) db.media_urls = est.mediaUrls;
  if (est.notes !== undefined) db.notes = est.notes;
  return db;
};

const mapDBToAppointment = (db: any): Appointment => ({
  id: db.id,
  uid: db.uid,
  clientName: db.client_name,
  clientPhone: db.client_phone,
  clientEmail: db.client_email,
  clientAddress: db.client_address,
  notes: db.notes,
  date: db.date,
  time: db.time,
  status: db.status,
});

const mapAppointmentToDB = (app: Partial<Appointment>) => {
  const db: any = {};
  if (app.clientName !== undefined) db.client_name = app.clientName;
  if (app.clientPhone !== undefined) db.client_phone = app.clientPhone;
  if (app.clientEmail !== undefined) db.client_email = app.clientEmail;
  if (app.clientAddress !== undefined) db.client_address = app.clientAddress;
  if (app.notes !== undefined) db.notes = app.notes;
  if (app.date !== undefined) db.date = app.date;
  if (app.time !== undefined) db.time = app.time;
  if (app.status !== undefined) db.status = app.status;
  return db;
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

  // Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load User Data
  useEffect(() => {
    if (!user) {
      setHistory([]);
      setAppointments([]);
      return;
    }

    // Fetch Estimates
    const fetchEstimates = async () => {
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) setHistory(data.map(mapDBToEstimate));
      } catch (err) {
        console.error("Error fetching estimates:", err);
      }
    };

    // Fetch Appointments
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true });
        
        if (!error && data) setAppointments(data.map(mapDBToAppointment));
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    // Fetch Settings
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .single();
        
        if (!error && data) {
          setBusinessPhoneState(data.business_phone || '');
          setLaborPricePerM2(data.labor_price_per_m2 || 20);
          if (data.default_prices) {
            setDefaultPrices(prev => ({ ...prev, ...data.default_prices }));
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchEstimates();
    fetchAppointments();
    fetchSettings();

    // Subscriptions for real-time
    const estimatesSub = supabase
      .channel('estimates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estimates' }, fetchEstimates)
      .subscribe();

    const appointmentsSub = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAppointments)
      .subscribe();

    return () => {
      estimatesSub.unsubscribe();
      appointmentsSub.unsubscribe();
    };
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateSettings = async (settings: { 
    businessPhone?: string; 
    laborPricePerM2?: number;
    defaultPrices?: Record<PricingType, number>;
  }) => {
    if (!user) return;

    const updateData: any = {};
    if (settings.businessPhone !== undefined) updateData.business_phone = settings.businessPhone;
    if (settings.laborPricePerM2 !== undefined) updateData.labor_price_per_m2 = settings.laborPricePerM2;
    if (settings.defaultPrices !== undefined) updateData.default_prices = { ...defaultPrices, ...settings.defaultPrices };

    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        uid: user.id, 
        ...updateData,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      if (settings.businessPhone !== undefined) setBusinessPhoneState(settings.businessPhone);
      if (settings.laborPricePerM2 !== undefined) setLaborPricePerM2(settings.laborPricePerM2);
      if (settings.defaultPrices !== undefined) setDefaultPrices(prev => ({ ...prev, ...settings.defaultPrices }));
    }
  };

  const setBusinessPhone = async (phone: string) => {
    await updateSettings({ businessPhone: phone });
  };

  const saveEstimate = async (estimateData: Omit<Estimate, 'id' | 'uid'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('estimates')
      .insert([{ ...mapEstimateToDB(estimateData), uid: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error saving estimate:", error);
      return;
    }

    return data.id;
  };

  const getEstimateById = async (id: string): Promise<Estimate | null> => {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return mapDBToEstimate(data);
  };

  const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'uid'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('appointments')
      .insert([{ ...mapAppointmentToDB(appointmentData), uid: user.id }]);

    if (error) console.error("Error saving appointment:", error);
  };

  const updateAppointment = async (updatedApp: Appointment) => {
    if (!user) return;

    const { error } = await supabase
      .from('appointments')
      .update(mapAppointmentToDB(updatedApp))
      .eq('id', updatedApp.id);

    if (error) console.error("Error updating appointment:", error);
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) console.error("Error deleting appointment:", error);
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
