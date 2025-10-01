import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, doc, writeBatch, addDoc } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import { useAuth } from './AuthContext';

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
  const { db, app } = useFirebase();
  const { user } = useAuth();

  const appId = app.options.projectId || '';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribes: Array<() => void> = [];

    // Products listener
    const productsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'products');
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);

      // Seed initial data if empty
      if (productsData.length === 0) {
        seedInitialData();
      }
    });
    unsubscribes.push(unsubscribeProducts);

    // Customers listener
    const customersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'customers');
    const unsubscribeCustomers = onSnapshot(customersRef, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
    });
    unsubscribes.push(unsubscribeCustomers);

    // Sales listener
    const salesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'sales');
    const unsubscribeSales = onSnapshot(salesRef, (snapshot) => {
      const salesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date ? data.date.toDate() : new Date()
        };
      }) as Sale[];
      setSales(salesData);
    });
    unsubscribes.push(unsubscribeSales);

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db, appId]);

  const seedInitialData = async () => {
    if (!user) return;

    const sampleProducts = [
      { name: 'Kopi Hitam', brand: 'Kapal Api', category: 'Minuman', costPrice: 3000, price: 5000, stock: 100, icon: 'lni lni-coffee-cup', iconColor: '#6f4e37' },
      { name: 'Kopi Susu', brand: 'Indocafe', category: 'Minuman', costPrice: 4500, price: 7000, stock: 80, icon: 'fas fa-coffee', iconColor: '#c4a689' },
      { name: 'Roti Bakar', brand: 'Sari Roti', category: 'Makanan', costPrice: 8000, price: 12000, stock: 50, icon: 'lni lni-dinner', iconColor: '#d4a373' },
      { name: 'Pisang Goreng', brand: '', category: 'Camilan', costPrice: 1000, price: 2000, stock: 40, icon: 'lni lni-cake', iconColor: '#a7c957' },
    ];

    const sampleCustomers = [
      { name: 'Andi', phone: '08123456789', wallet: 50000, email: 'andi@example.com', gender: 'Laki-laki', address: 'Jl. Merdeka 1' },
      { name: 'Budi', phone: '08987654321', wallet: 15000, email: 'budi@example.com', gender: 'Laki-laki', address: 'Jl. Pahlawan 2' },
    ];

    const batch = writeBatch(db);
    
    sampleProducts.forEach(product => {
      const docRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'products'));
      batch.set(docRef, product);
    });

    sampleCustomers.forEach(customer => {
      const docRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'customers'));
      batch.set(docRef, customer);
    });

    await batch.commit();
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    const productsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'products');
    await addDoc(productsRef, product);
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    if (!user) throw new Error('User not authenticated');
    const productRef = doc(db, 'artifacts', appId, 'users', user.uid, 'products', id);
    const batch = writeBatch(db);
    batch.update(productRef, product);
    await batch.commit();
  };

  const deleteProduct = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const productRef = doc(db, 'artifacts', appId, 'users', user.uid, 'products', id);
    const batch = writeBatch(db);
    batch.delete(productRef);
    await batch.commit();
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    const customersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'customers');
    await addDoc(customersRef, { ...customer, wallet: customer.wallet || 0 });
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    if (!user) throw new Error('User not authenticated');
    const customerRef = doc(db, 'artifacts', appId, 'users', user.uid, 'customers', id);
    const batch = writeBatch(db);
    batch.update(customerRef, customer);
    await batch.commit();
  };

  const deleteCustomer = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const customerRef = doc(db, 'artifacts', appId, 'users', user.uid, 'customers', id);
    const batch = writeBatch(db);
    batch.delete(customerRef);
    await batch.commit();
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    const salesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'sales');
    await addDoc(salesRef, {
      ...sale,
      date: new Date()
    });
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
    addSale
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};