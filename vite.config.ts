import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  server: {
    host: "::",
    port: 3000,
    // Add strict port to prevent random port assignment
    strictPort: true,
    // Add CORS configuration
    cors: true,
  },
    plugins: [
      react(),
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
  // Environment variables are automatically handled by Vite
  // when using import.meta.env, no need to define them here
  };
});
