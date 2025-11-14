import { StrictMode } from "react"; // <-- Use named import
import { createRoot } from "react-dom/client"; // <-- Use named import
import "./styles/global.css";
import App from "./App";
import { AppProvider } from "./context/AppContext";

// --- Safer check for the root element (fixes the '!' warning) ---
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}
// --- End of fix ---

// Use the new createRoot function directly
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    {" "}
    {/* <-- Use named import */}
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
