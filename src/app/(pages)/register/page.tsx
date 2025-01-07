import Register from "@/components/Register";
import LoadingPage from "@/components/ui/LoadingPage";
import React, { Suspense } from "react";

function RegisterPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Register />
    </Suspense>
  );
}

export default RegisterPage;
