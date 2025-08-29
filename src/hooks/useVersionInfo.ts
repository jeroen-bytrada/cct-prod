import { useState, useEffect } from 'react';

// Declare global variables injected by Vite
declare global {
  const __GIT_COMMIT__: string;
  const __GIT_BRANCH__: string;
  const __BUILD_TIME__: string;
}

export interface VersionInfo {
  commit: string;
  branch: string;
  buildTime: string;
  displayString: string;
}

/**
 * Hook to get version information including Git commit, branch, and build time
 */
export const useVersionInfo = (): VersionInfo => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    commit: 'unknown',
    branch: 'unknown',
    buildTime: 'unknown',
    displayString: 'unknown',
  });

  useEffect(() => {
    try {
      const commit = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev';
      const branch = typeof __GIT_BRANCH__ !== 'undefined' ? __GIT_BRANCH__ : 'local';
      const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();
      
      // Show just commit hash for detached HEAD (common in deployments)
      // Otherwise show commit • branch
      const displayString = branch === 'HEAD' ? commit : `${commit} • ${branch}`;
      
      setVersionInfo({
        commit,
        branch,
        buildTime,
        displayString,
      });
    } catch (error) {
      console.warn('Failed to get version info:', error);
    }
  }, []);

  return versionInfo;
};