
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeLogoProps {
  className?: string;
}

export function ThemeLogo({ className = "" }: ThemeLogoProps) {
  const { theme } = useTheme();
  
  const logoPath = theme === "dark" 
    ? "/lovable-uploads/8529d56f-d27b-4581-bf35-438093478f86.png" 
    : "/lovable-uploads/8b05a71c-7bac-4f18-a99a-e66eb1e00156.png";
  
  return (
    <img 
      src={logoPath} 
      alt="FOTA Logo" 
      className={`h-8 ${className}`} 
    />
  );
}
