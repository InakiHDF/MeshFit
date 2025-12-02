'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Initialize Supabase Client with Service Role for Admin tasks if needed, 
// but for RLS we should use the user's session.
// Actually, for Server Actions with RLS, we need to create a client that uses the user's cookies.
// Since we are using the basic client in lib/supabase.ts which is client-side or anon,
// we need a way to pass the session.
// For simplicity in this "Username" approach, we will use the standard Supabase Auth helpers if available,
// or just manually handle the session with the JS client if we were doing a full SSR setup.
// BUT, to keep it simple and robust:
// We will use the REST API via the JS client, but we need to handle the auth token.

// Let's use the standard pattern for Next.js App Router + Supabase
// We need to install @supabase/ssr to do this properly in Server Actions.
// But the user didn't ask for that specifically, and we have @supabase/supabase-js.
// We can manage cookies manually or just use the client-side auth for the initial login 
// and then pass the token? No, Server Actions are better.

// Let's try to use a simple cookie-based approach for the "Username" auth.
// We will create a client that persists the session in cookies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // We handle cookies manually if needed, or rely on client passing it?
      // Actually, for Server Actions, we usually want to read the cookie.
    }
  });
}

// Helper to get a client with the user's access token from cookies
async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  const refresh = cookieStore.get('sb-refresh-token')?.value;

  const client = createClient(supabaseUrl, supabaseKey);

  if (token && refresh) {
    await client.auth.setSession({
      access_token: token,
      refresh_token: refresh,
    });
  }
  return client;
}

export async function signUp(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const email = `${username}@meshfit.com`;

  const client = createServerSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Auto sign-in logic or redirect
  if (data.session) {
    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', data.session.access_token);
    cookieStore.set('sb-refresh-token', data.session.refresh_token);
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const email = `${username}@meshfit.com`;

  const client = createServerSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', data.session.access_token);
    cookieStore.set('sb-refresh-token', data.session.refresh_token);
  }

  return { success: true };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  redirect('/login');
}

// --- Data Actions ---

export async function uploadItem(formData: FormData) {
  const client = await getAuthenticatedClient();
  const user = await client.auth.getUser();
  if (!user.data.user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const color = formData.get('color') as string;
  const material = formData.get('material') as string;
  const fit = formData.get('fit') as string;
  const formality = Number(formData.get('formality'));
  const warmth = Number(formData.get('warmth'));
  const imageFile = formData.get('image') as File;

  let image_url = '';

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.data.user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await client.storage
      .from('item-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Continue without image or return error?
    } else {
      const { data: publicUrlData } = client.storage
        .from('item-images')
        .getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }
  }

  // Get Category ID
  const { data: catData } = await client
    .from('categories')
    .select('id')
    .ilike('name', category) // Assuming category name matches or we map it
    .single();

  // Fallback if category not found (shouldn't happen if seeded correctly)
  // For now, let's just use the raw string if we were storing it that way, 
  // but we have a category_id FK. 
  // Let's assume the frontend sends the ID or we look it up.
  // To keep it simple, let's look up by 'type' or 'name'.
  // Actually, the frontend form sends IDs like 'top', 'bottom'. 
  // We need to map these to the UUIDs in the DB.
  // Or we can just query for a category where type = input_category limit 1.

  let category_id = null;
  if (catData) {
    category_id = catData.id;
  } else {
    // Try to find any category of this type
    const { data: anyCat } = await client.from('categories').select('id').eq('type', category).limit(1).single();
    if (anyCat) category_id = anyCat.id;
  }

  const { error: insertError } = await client.from('items').insert({
    name,
    category_id,
    image_url,
    user_id: user.data.user.id,
    attributes: { color, material, fit, formality, warmth }
  });

  if (insertError) return { error: insertError.message };
  return { success: true };
}

export async function createConnection(idA: string, idB: string) {
  const client = await getAuthenticatedClient();
  const user = await client.auth.getUser();
  if (!user.data.user) return { error: 'Unauthorized' };

  // Enforce Order
  const [first, second] = idA < idB ? [idA, idB] : [idB, idA];

  const { error } = await client.from('connections').insert({
    item_id_a: first,
    item_id_b: second,
    user_id: user.data.user.id
  });

  if (error) {
    // Ignore duplicate key error
    if (error.code === '23505') return { success: true };
    return { error: error.message };
  }
  return { success: true };
}

export async function getGraphData() {
  const client = await getAuthenticatedClient();
  const { data: items } = await client.from('items').select('*, categories(name, type)');
  const { data: connections } = await client.from('connections').select('*');

  return { items, connections };
}

export async function generateOutfits() {
  const client = await getAuthenticatedClient();
  const { data: items } = await client.from('items').select('*, categories(type)');
  const { data: connections } = await client.from('connections').select('*');

  if (!items || !connections) return [];

  // Build Adjacency List
  const adj = new Map<string, Set<string>>();
  items.forEach(i => adj.set(i.id, new Set()));
  connections.forEach(c => {
    adj.get(c.item_id_a)?.add(c.item_id_b);
    adj.get(c.item_id_b)?.add(c.item_id_a);
  });

  // Simple Clique Finder for [Top, Bottom, Footwear]
  // 1. Filter items by type
  const tops = items.filter(i => i.categories?.type === 'top');
  const bottoms = items.filter(i => i.categories?.type === 'bottom');
  const footwear = items.filter(i => i.categories?.type === 'footwear');

  const outfits = [];
  let idCounter = 1;

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of footwear) {
        // Check connectivity
        // Top <-> Bottom
        const tb = adj.get(top.id)?.has(bottom.id);
        // Bottom <-> Shoe
        const bs = adj.get(bottom.id)?.has(shoe.id);
        // Top <-> Shoe (Optional? Let's enforce full clique for "MeshFit" quality)
        const ts = adj.get(top.id)?.has(shoe.id);

        if (tb && bs && ts) {
          outfits.push({
            id: String(idCounter++),
            items: [top, bottom, shoe]
          });
        }
      }
    }
  }

  return outfits;
}
