
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PasswordFieldProps {
  password: string;
  validatePassword: (input: string) => void;
  isPasswordValid: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ 
  password, 
  validatePassword,
  isPasswordValid 
}) => {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="password" className="flex items-center gap-1">
        <Lock className="h-4 w-4" /> Password
      </Label>
      <Input 
        id="password" 
        type="password"
        placeholder="Enter upload password" 
        value={password}
        onChange={(e) => validatePassword(e.target.value)}
        className={isPasswordValid ? "border-green-500" : ""}
      />
      <p className="text-sm text-muted-foreground">
        Enter the password to upload firmware
      </p>
    </div>
  );
};
