"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export type ActionResult = { error?: string; ok?: boolean } | void;

/**
 * A <form> wired to a server action. Errors returned as `{ error }` show as a
 * toast; redirects thrown by the action just navigate.
 */
export function ActionForm({
  action,
  children,
  className,
  successMessage,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const [state, formAction] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => (await action(formData)) ?? null,
    null,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.ok && successMessage) toast.success(successMessage);
  }, [state, successMessage]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
