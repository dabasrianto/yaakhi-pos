/*
  # Membuat Tabel untuk Aplikasi POS

  ## Tabel Baru
  
  ### 1. products
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key ke auth.users)
  - `name` (text) - Nama produk
  - `brand` (text) - Merek produk (opsional)
  - `category` (text) - Kategori produk
  - `cost_price` (numeric) - Harga modal
  - `price` (numeric) - Harga jual
  - `stock` (integer) - Jumlah stok
  - `icon` (text) - Icon class (opsional)
  - `icon_color` (text) - Warna icon (opsional)
  - `created_at` (timestamptz) - Waktu dibuat
  - `updated_at` (timestamptz) - Waktu diupdate

  ### 2. customers
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key ke auth.users)
  - `name` (text) - Nama pelanggan
  - `phone` (text) - Nomor telepon (opsional)
  - `email` (text) - Email (opsional)
  - `gender` (text) - Jenis kelamin (opsional)
  - `address` (text) - Alamat (opsional)
  - `wallet` (numeric) - Saldo dompet
  - `created_at` (timestamptz) - Waktu dibuat
  - `updated_at` (timestamptz) - Waktu diupdate

  ### 3. sales
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key ke auth.users)
  - `date` (timestamptz) - Tanggal transaksi
  - `items` (jsonb) - Detail items yang dibeli
  - `subtotal` (numeric) - Subtotal sebelum diskon dan pajak
  - `discount` (jsonb) - Detail diskon (type, value, amount)
  - `tax` (jsonb) - Detail pajak (type, value, amount)
  - `final_total` (numeric) - Total akhir setelah diskon dan pajak
  - `payment_method` (text) - Metode pembayaran
  - `customer_id` (uuid) - ID pelanggan (opsional)
  - `customer_name` (text) - Nama pelanggan (opsional)
  - `created_at` (timestamptz) - Waktu dibuat

  ### 4. user_profiles
  - `id` (uuid, primary key, foreign key ke auth.users)
  - `email` (text) - Email user
  - `display_name` (text) - Nama tampilan
  - `subscription_status` (text) - Status langganan (trial/active/expired)
  - `trial_start_date` (timestamptz) - Tanggal mulai trial
  - `created_at` (timestamptz) - Waktu dibuat
  - `updated_at` (timestamptz) - Waktu diupdate

  ## Keamanan
  
  - Enable Row Level Security (RLS) untuk semua tabel
  - User hanya bisa mengakses data mereka sendiri
  - Policies untuk SELECT, INSERT, UPDATE, DELETE
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  brand text DEFAULT '',
  category text NOT NULL,
  cost_price numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  icon text DEFAULT '',
  icon_color text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  gender text DEFAULT '',
  address text DEFAULT '',
  wallet numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date timestamptz DEFAULT now(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount jsonb DEFAULT '{"type": "none", "value": 0, "amount": 0}'::jsonb,
  tax jsonb DEFAULT '{"type": "none", "value": 0, "amount": 0}'::jsonb,
  final_total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  customer_id uuid,
  customer_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text DEFAULT '',
  subscription_status text DEFAULT 'trial',
  trial_start_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON customers(user_id);
CREATE INDEX IF NOT EXISTS sales_user_id_idx ON sales(user_id);
CREATE INDEX IF NOT EXISTS sales_date_idx ON sales(date);
CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON sales(customer_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();