import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      // Add strict port to prevent random port assignment
      strictPort: true,
      // Add CORS configuration
      cors: true,
    },
    plugins: [
      react({
        // Enable React Fast Refresh
        fastRefresh: true,
      }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Add build options
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      // Improve chunking strategy
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom']
          },
        },
      },
    },
    // Add optimizations
    optimizeDeps: {
      include: [
        'react', 
        'react-dom'
      ],
    },
    define: {
      'process.env': {
        VITE_FIREBASE_API_KEY: JSON.stringify(env.VITE_FIREBASE_API_KEY),
        VITE_FIREBASE_AUTH_DOMAIN: JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        VITE_FIREBASE_PROJECT_ID: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        VITE_FIREBASE_STORAGE_BUCKET: JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        VITE_FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        VITE_FIREBASE_APP_ID: JSON.stringify(env.VITE_FIREBASE_APP_ID),
        VITE_FIREBASE_MEASUREMENT_ID: JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID)
      }
    }
  };
});
