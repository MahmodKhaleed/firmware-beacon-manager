
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Try to get theme from localStorage
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Apply theme class to document element
if (savedTheme) {
  document.documentElement.classList.add(savedTheme);
} else if (prefersDark) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.add("light");
}

createRoot(document.getElementById("root")!).render(<App />);
