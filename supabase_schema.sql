-- 1. Create the tools table
CREATE TABLE tools (
    id integer PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    status text NOT NULL,
    description text,
    url text NOT NULL,
    tags text[],
    featured boolean DEFAULT false,
    new boolean DEFAULT false,
    notes text
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access (so anyone can view the dashboard)
CREATE POLICY "Allow public read access" ON tools 
FOR SELECT USING (true);

-- 4. Allow authenticated users to update (for the admin page)
CREATE POLICY "Allow authenticated update" ON tools 
FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Allow authenticated users to insert tools (just in case)
CREATE POLICY "Allow authenticated insert" ON tools 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
