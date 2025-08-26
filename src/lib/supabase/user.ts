
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

// New function to fetch all users with their roles
export async function getAllUsers(): Promise<UserWithRole[]> {
  try {
    // Enforce admin-only access on client side as well
    const isAdmin = await checkUserRole('admin');
    if (!isAdmin) {
      console.warn('Unauthorized getAllUsers() access attempt');
      return [];
    }

    // First get all authenticated users from auth.users (requires service role on server)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return [];
    }
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }
    
    // Get all user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return [];
    }
    
    // Create a map of profile data for quick lookup
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
    
    // Create a map of user roles for quick lookup
    const roleMap = new Map();
    userRoles.forEach(role => {
      roleMap.set(role.user_id, role.role);
    });
    
    // Combine the data
    const usersWithRoles = authUsers.users.map(user => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name || null,
        role: roleMap.get(user.id) || 'user'
      };
    });
    
    return usersWithRoles;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
}

// Type for user with role information
export type UserWithRole = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};
