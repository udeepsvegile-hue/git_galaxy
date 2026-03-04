import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glsl({
      include: ["**/*.glsl", "**/*.vert", "**/*.frag", "**/*.vs", "**/*.fs"],
      compress: false,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@scenes": path.resolve(__dirname, "./src/scenes"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor bundles
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
          "postprocessing-vendor": [
            "postprocessing",
            "@react-three/postprocessing",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },

  server: {
    port: 5173,
    host: true,
    // Proxy to Netlify functions in dev (when not using netlify dev)
    proxy: {
      "/.netlify/functions": {
        target: "http://127.0.0.1:8888",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            const response = res as {
              writeHead: (statusCode: number, headers: Record<string, string>) => void;
              end: (chunk?: string) => void;
              headersSent?: boolean;
            };

            if (!response.headersSent) {
              response.writeHead(503, { "Content-Type": "application/json" });
            }

            response.end(
              JSON.stringify({
                error: "Netlify function server is unavailable.",
                type: "network",
                hint: "Run `npm run netlify:dev` to start /.netlify/functions locally.",
              })
            );
          });
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@react-three/postprocessing",
      "postprocessing",
      "buffer",
    ],
  },
});
