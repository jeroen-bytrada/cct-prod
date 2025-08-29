import { useState, useEffect } from 'react';

/**
 * Hook to get the current Git branch name
 * This will show the branch based on the deployment context
 */
export const useGitBranch = () => {
  const [branch, setBranch] = useState<string>('main');

  useEffect(() => {
    // In Lovable, we typically use 'main' as the default branch
    // This could be enhanced to detect the actual branch through other means
    setBranch('main');
  }, []);

  return branch;
};