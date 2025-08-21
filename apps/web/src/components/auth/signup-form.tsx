"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type SignupFormValues = { email: string; password: string; displayName?: string };

export default function SignupForm() {
  const form = useForm<SignupFormValues>({
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const onSubmit = (values: SignupFormValues) => {
    // Call your sign-up action (emulator-aware).
    // e.g. await createUserWithEmailAndPassword(getAuth(app), values.email, values.password)
    // then write profile to Firestore, etc.
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button className="btn btn-primary" type="submit">
          Create account
        </button>
      </form>
    </Form>
  );
}