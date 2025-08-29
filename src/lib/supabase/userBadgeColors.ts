import { supabase } from './client';

// Cache for user badge colors to avoid repeated queries
const badgeColorCache = new Map<string, string>();

export async function getUserBadgeColor(fullName: string | null): Promise<string> {
  // Default color for users without a name or color
  const defaultColor = '#e5e7eb';
  
  if (!fullName) {
    return defaultColor;
  }

  // Check cache first
  if (badgeColorCache.has(fullName)) {
    return badgeColorCache.get(fullName)!;
  }

  try {
    // Use RPC to get the badge color for this user
    const { data, error } = await supabase
      .rpc('get_profile_display_info_by_names', { names: [fullName] });

    if (error) {
      console.error('Error fetching user badge color:', error);
      return defaultColor;
    }

    const color = data?.[0]?.badge_color || defaultColor;
    
    // Cache the result
    badgeColorCache.set(fullName, color);
    
    return color;
  } catch (error) {
    console.error('Error fetching user badge color:', error);
    return defaultColor;
  }
}

// Function to clear the cache when needed (e.g., when profiles are updated)
export function clearBadgeColorCache() {
  badgeColorCache.clear();
}

// Function to batch load badge colors for multiple users at once
export async function getBadgeColorsForUsers(userNames: (string | null)[]): Promise<Map<string, string>> {
  const colorMap = new Map<string, string>();
  const defaultColor = '#e5e7eb';
  
  // Filter out null/empty names and get unique names
  const validNames = [...new Set(userNames.filter(name => name && name.trim()))];
  
  if (validNames.length === 0) {
    return colorMap;
  }

  // Check which names we already have in cache
  const uncachedNames = validNames.filter(name => !badgeColorCache.has(name));
  
  // Get cached results
  validNames.forEach(name => {
    if (badgeColorCache.has(name)) {
      colorMap.set(name, badgeColorCache.get(name)!);
    }
  });

  // Query for uncached names
  if (uncachedNames.length > 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_profile_display_info_by_names', { names: uncachedNames });

      if (error) {
        console.error('Error batch fetching user badge colors:', error);
        // Set default colors for uncached names
        uncachedNames.forEach(name => {
          colorMap.set(name, defaultColor);
          badgeColorCache.set(name, defaultColor);
        });
        return colorMap;
      }

      // Process results
      data?.forEach(profile => {
        const color = profile.badge_color || defaultColor;
        colorMap.set(profile.full_name, color);
        badgeColorCache.set(profile.full_name, color);
      });

      // Set default color for users not found in profiles
      uncachedNames.forEach(name => {
        if (!colorMap.has(name)) {
          colorMap.set(name, defaultColor);
          badgeColorCache.set(name, defaultColor);
        }
      });

    } catch (error) {
      console.error('Error batch fetching user badge colors:', error);
      // Set default colors for all uncached names
      uncachedNames.forEach(name => {
        colorMap.set(name, defaultColor);
        badgeColorCache.set(name, defaultColor);
      });
    }
  }

  return colorMap;
}