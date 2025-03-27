
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

// New function to manage user roles
export async function setUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
  try {
    // First check if the user already has this role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // Some other error occurred
      console.error('Error checking existing role:', checkError);
      return false;
    }
    
    // If the role already exists, no need to add it again
    if (existingRole) {
      return true;
    }
    
    // Add the new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
      
    if (insertError) {
      console.error('Error adding role:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setUserRole:', error);
    return false;
  }
}

export async function removeUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) {
      console.error('Error removing role:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeUserRole:', error);
    return false;
  }
}
