import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeFirebase } from "./lib/firebase";

// Initialize Firebase before rendering the app
try {
  initializeFirebase();
  console.log("[Firebase] Firebase services initialized successfully");
} catch (error) {
  console.error("[Firebase] Failed to initialize Firebase:", error);
}

createRoot(document.getElementById("root")!).render(<App />);
