
import { supabase } from './client'
import { UserProfile } from './types'

// User profile-related queries
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

export async function checkUserRole(role: 'admin' | 'user'): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session?.user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', session.session.user.id)
    .eq('role', role)
    .single();
  
  if (error) {
    // Error here often means no matching record was found
    return false;
  }
  
  return !!data;
}
