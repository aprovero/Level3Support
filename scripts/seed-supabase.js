const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedDatabase() {
    console.log('Starting Supabase Seeding Process...');

    // 1. Create Admin User
    console.log('Creating admin user aprovero@gmail.com...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'aprovero@gmail.com',
        password: 'Aprovero.15662943',
        email_confirm: true
    });

    if (userError) {
        if (userError.message.includes('already exists')) {
            console.log('Admin user already exists, skipping creation.');
        } else {
            console.error('Error creating user:', userError.message);
        }
    } else {
        console.log('Admin user created successfully:', userData.user.id);
    }

    // 2. Read tools data
    console.log('Reading tools-data.json...');
    const toolsDataPath = path.join(__dirname, '../tools-data.json');
    let tools = [];
    try {
        const rawData = fs.readFileSync(toolsDataPath, 'utf8');
        const parsed = JSON.parse(rawData);
        tools = parsed.tools || [];
    } catch (e) {
        console.error('Failed to read tools-data.json:', e);
        return;
    }

    if (tools.length === 0) {
        console.log('No tools found to insert.');
        return;
    }

    // Clean up tools to match the DB schema
    const formattedTools = tools.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        status: t.status,
        description: t.description,
        url: t.url,
        tags: t.tags || [],
        featured: t.featured || false,
        new: t.new || false,
        notes: t.notes || ''
    }));

    console.log(`Uploading ${formattedTools.length} tools to Supabase...`);
    
    // 3. Upsert tools
    const { data: insertData, error: insertError } = await supabase
        .from('tools')
        .upsert(formattedTools, { onConflict: 'id' });

    if (insertError) {
        console.error('Error inserting tools:', insertError.message);
    } else {
        console.log('Tools successfully seeded into Supabase!');
    }
}

seedDatabase();
