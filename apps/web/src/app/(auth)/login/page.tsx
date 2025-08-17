'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoginSchema, type LoginSchema as LoginSchemaType } from '@nurseconnect-v2/packages/contracts';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setError('');
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      isSignUp: 'false',
    });
    if (result?.error) {
      setError('Invalid credentials. Please try again.');
    } else if (result?.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="email" {...register('email')} placeholder="Email" />
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        <input type="password" {...register('password')} placeholder="Password" />
        {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}