import type { ZodError } from "zod";
export function zodToFieldErrors(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
}
