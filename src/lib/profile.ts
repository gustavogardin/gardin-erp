import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  fullName: string;
  role: string;
  canViewFinancials: boolean;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, can_view_financials")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    fullName: profile?.full_name ?? user.email ?? "",
    role: profile?.role ?? "comercial",
    canViewFinancials: profile?.can_view_financials ?? true,
  };
}
