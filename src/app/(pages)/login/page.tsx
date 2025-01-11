import Providers from "@/app/Providers";
import Login from "@/components/Login";
import LoadingPage from "@/components/ui/LoadingPage";
import React, { Suspense } from "react";

function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Login />
    </Suspense>
  );
}

export default LoginPage;
