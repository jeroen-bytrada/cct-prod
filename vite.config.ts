import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Get Git information during build
const getGitInfo = () => {
  try {
    // Get full commit hash and take first 7 characters to match GitHub format
    const fullCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const commit = fullCommit.substring(0, 7);
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return { commit, branch };
  } catch {
    return { commit: 'unknown', branch: 'unknown' };
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gitInfo = getGitInfo();
  const buildTime = new Date().toISOString();

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __GIT_COMMIT__: JSON.stringify(gitInfo.commit),
      __GIT_BRANCH__: JSON.stringify(gitInfo.branch),
      __BUILD_TIME__: JSON.stringify(buildTime),
    },
  };
});
