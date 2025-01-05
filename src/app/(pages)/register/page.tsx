import Register from "@/components/Register";
import React, { Suspense } from "react";

function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Register />
    </Suspense>
  );
}

export default RegisterPage;
