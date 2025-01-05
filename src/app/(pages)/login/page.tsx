import Login from "@/components/Login";
import React, { Suspense } from "react";

function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}

export default LoginPage;
