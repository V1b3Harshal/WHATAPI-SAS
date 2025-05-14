// app/verify-email/page.tsx
import { Suspense } from "react";
import { VerifyForm } from "./verify-form";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading verification...
        </div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}