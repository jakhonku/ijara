import { LoginForm } from "./login-form";
import { HardHat } from "lucide-react";

export const metadata = {
  title: "Kirish — TechnaIjara",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3 justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TechnaIjara</h1>
            <p className="text-xs text-muted-foreground">
              Qurilish texnikasi ijarasi
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
