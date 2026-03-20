import { supabase } from './lib/supabase';

async function checkRoles() {
  const { data, error } = await supabase
    .from('User')
    .select('role')
    .limit(100);
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  const roles = [...new Set(data?.map(u => u.role))];
  console.log('Unique roles in User table:', roles);
}

checkRoles();
