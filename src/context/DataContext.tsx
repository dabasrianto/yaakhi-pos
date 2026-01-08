import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  costPrice: number;
  price: number;
  stock: number;
  icon?: string;
  iconColor?: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  address?: string;
  wallet?: number;
}

interface Sale {
  id: string;
  date: Date;
  items: any[];
  subtotal: number;
  discount: { type: string; value: number; amount: number };
  tax: { type: string; value: number; amount: number };
  finalTotal: number;
  paymentMethod: string;
  customer?: { id: string; name: string };
}

interface DataContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setCustomers([]);
      setSales([]);
      setLoading(false);
      return;
    }

    loadData();
    const channels = setupRealtimeSubscriptions();

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [productsRes, customersRes, salesRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('sales').select('*').eq('user_id', user.id),
      ]);

      if (productsRes.data) {
        const mappedProducts = productsRes.data.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          category: p.category,
          costPrice: parseFloat(p.cost_price),
          price: parseFloat(p.price),
          stock: p.stock,
          icon: p.icon || '',
          iconColor: p.icon_color || '',
        }));
        setProducts(mappedProducts);

        if (mappedProducts.length === 0) {
          await seedInitialData();
        }
      }

      if (customersRes.data) {
        const mappedCustomers = customersRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          gender: c.gender || '',
          address: c.address || '',
          wallet: parseFloat(c.wallet) || 0,
        }));
        setCustomers(mappedCustomers);
      }

      if (salesRes.data) {
        const mappedSales = salesRes.data.map((s) => ({
          id: s.id,
          date: new Date(s.date),
          items: s.items || [],
          subtotal: parseFloat(s.subtotal),
          discount: s.discount || { type: 'none', value: 0, amount: 0 },
          tax: s.tax || { type: 'none', value: 0, amount: 0 },
          finalTotal: parseFloat(s.final_total),
          paymentMethod: s.payment_method,
          customer: s.customer_id ? { id: s.customer_id, name: s.customer_name || '' } : undefined,
        }));
        setSales(mappedSales);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = (): RealtimeChannel[] => {
    if (!user) return [];

    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    const salesChannel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return [productsChannel, customersChannel, salesChannel];
  };

  const seedInitialData = async () => {
    if (!user) return;

    const sampleProducts = [
      {
        user_id: user.id,
        name: 'Kopi Hitam',
        brand: 'Kapal Api',
        category: 'Minuman',
        cost_price: 3000,
        price: 5000,
        stock: 100,
        icon: 'lni lni-coffee-cup',
        icon_color: '#6f4e37',
      },
      {
        user_id: user.id,
        name: 'Kopi Susu',
        brand: 'Indocafe',
        category: 'Minuman',
        cost_price: 4500,
        price: 7000,
        stock: 80,
        icon: 'fas fa-coffee',
        icon_color: '#c4a689',
      },
      {
        user_id: user.id,
        name: 'Roti Bakar',
        brand: 'Sari Roti',
        category: 'Makanan',
        cost_price: 8000,
        price: 12000,
        stock: 50,
        icon: 'lni lni-dinner',
        icon_color: '#d4a373',
      },
      {
        user_id: user.id,
        name: 'Pisang Goreng',
        brand: '',
        category: 'Camilan',
        cost_price: 1000,
        price: 2000,
        stock: 40,
        icon: 'lni lni-cake',
        icon_color: '#a7c957',
      },
    ];

    const sampleCustomers = [
      {
        user_id: user.id,
        name: 'Andi',
        phone: '08123456789',
        wallet: 50000,
        email: 'andi@example.com',
        gender: 'Laki-laki',
        address: 'Jl. Merdeka 1',
      },
      {
        user_id: user.id,
        name: 'Budi',
        phone: '08987654321',
        wallet: 15000,
        email: 'budi@example.com',
        gender: 'Laki-laki',
        address: 'Jl. Pahlawan 2',
      },
    ];

    await Promise.all([
      supabase.from('products').insert(sampleProducts),
      supabase.from('customers').insert(sampleCustomers),
    ]);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('products').insert({
      user_id: user.id,
      name: product.name,
      brand: product.brand || '',
      category: product.category,
      cost_price: product.costPrice,
      price: product.price,
      stock: product.stock,
      icon: product.icon || '',
      icon_color: product.iconColor || '',
    });

    if (error) throw error;
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {};
    if (product.name !== undefined) updateData.name = product.name;
    if (product.brand !== undefined) updateData.brand = product.brand;
    if (product.category !== undefined) updateData.category = product.category;
    if (product.costPrice !== undefined) updateData.cost_price = product.costPrice;
    if (product.price !== undefined) updateData.price = product.price;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.icon !== undefined) updateData.icon = product.icon;
    if (product.iconColor !== undefined) updateData.icon_color = product.iconColor;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const deleteProduct = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('customers').insert({
      user_id: user.id,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      gender: customer.gender || '',
      address: customer.address || '',
      wallet: customer.wallet || 0,
    });

    if (error) throw error;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {};
    if (customer.name !== undefined) updateData.name = customer.name;
    if (customer.phone !== undefined) updateData.phone = customer.phone;
    if (customer.email !== undefined) updateData.email = customer.email;
    if (customer.gender !== undefined) updateData.gender = customer.gender;
    if (customer.address !== undefined) updateData.address = customer.address;
    if (customer.wallet !== undefined) updateData.wallet = customer.wallet;

    const { error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const deleteCustomer = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('sales').insert({
      user_id: user.id,
      date: new Date().toISOString(),
      items: sale.items,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      final_total: sale.finalTotal,
      payment_method: sale.paymentMethod,
      customer_id: sale.customer?.id || null,
      customer_name: sale.customer?.name || '',
    });

    if (error) throw error;
  };

  const value = {
    products,
    customers,
    sales,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSale,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
