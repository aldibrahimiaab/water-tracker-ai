-- Water Tracker Database Schema
-- Execute these SQL commands in Supabase SQL Editor

-- 0. Drop existing tables and functions (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_daily_stats_trigger ON water_entries;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_daily_stats();
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS water_entries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  daily_goal INTEGER DEFAULT 2000, -- in ml (2 liters)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create water_entries table
CREATE TABLE water_entries (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in ml
  consumed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create daily_stats table (for caching daily totals)
CREATE TABLE daily_stats (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_amount INTEGER DEFAULT 0, -- total ml for that day
  goal INTEGER DEFAULT 2000, -- daily goal on that day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, date)
);

-- 4. Create indexes for performance
CREATE INDEX water_entries_user_id_idx ON water_entries(user_id);
CREATE INDEX water_entries_consumed_at_idx ON water_entries(consumed_at);
CREATE INDEX daily_stats_user_id_idx ON daily_stats(user_id);
CREATE INDEX daily_stats_date_idx ON daily_stats(date);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Create RLS Policies for water_entries
CREATE POLICY "Users can view their own water entries"
  ON water_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own water entries"
  ON water_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own water entries"
  ON water_entries FOR DELETE
  USING (user_id = auth.uid());

-- 8. Create RLS Policies for daily_stats
CREATE POLICY "Users can view their own daily stats"
  ON daily_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own daily stats"
  ON daily_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily stats"
  ON daily_stats FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9. Create function to update daily_stats when water entry is added/deleted
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO daily_stats (user_id, date, total_amount, goal)
    VALUES (
      NEW.user_id,
      DATE(NEW.consumed_at),
      NEW.amount,
      (SELECT daily_goal FROM profiles WHERE id = NEW.user_id)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      total_amount = daily_stats.total_amount + NEW.amount,
      updated_at = NOW();
    RETURN NEW;
  END IF;

  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE daily_stats
    SET total_amount = total_amount - OLD.amount,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = DATE(OLD.consumed_at);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to call the function
CREATE TRIGGER update_daily_stats_trigger
AFTER INSERT OR DELETE ON water_entries
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- 11. Create function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, daily_goal)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    2000
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. Create trigger on auth.users to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
