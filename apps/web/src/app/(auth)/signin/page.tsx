"use client";

import LoginForm from "@/components/auth/login-form";

export default function SigninPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}