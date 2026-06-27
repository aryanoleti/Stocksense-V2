import { SignupForm } from "@/features/auth/signup-form";

export const metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SignupForm />
    </div>
  );
}
