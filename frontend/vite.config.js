import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  outputDir: "build",
  define: {
	"import.meta.env.VITE_API_URL": JSON.stringify('__VITE_API_URL__')
	}
});
