"use server";
import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";
import { loginSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { headers } from "next/headers";

export type LoginState = { errors?: FieldErrors };

export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const h = await headers();
  const res = await login(parsed.data.email, parsed.data.password, {
    ip: h.get("x-forwarded-for")?.split(",")[0] ?? undefined,
    ua: h.get("user-agent") ?? undefined,
  });
  if (!res.ok) return { errors: { _form: [res.error] } };

  const next = String(fd.get("next") || "");
  redirect(next || (res.role === "CLIENT" ? "/mon-compte" : "/admin"));
}

export async function logoutAction() {
  await logout();
  redirect("/");
}
