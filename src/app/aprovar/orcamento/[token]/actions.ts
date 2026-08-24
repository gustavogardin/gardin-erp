"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function approveQuote(formData: FormData) {
  const token = String(formData.get("token"));
  const approverName = String(formData.get("approver_name") || "").trim();

  if (!approverName) {
    redirect(`/aprovar/orcamento/${token}?erro=${encodeURIComponent("Informe seu nome para aprovar.")}`);
  }

  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, approval_token_expires_at, status")
    .eq("approval_token", token)
    .single();

  if (!quote) redirect(`/aprovar/orcamento/${token}?erro=${encodeURIComponent("Link inválido.")}`);

  if (quote!.approval_token_expires_at && new Date(quote!.approval_token_expires_at) < new Date()) {
    redirect(`/aprovar/orcamento/${token}?erro=${encodeURIComponent("Este link expirou.")}`);
  }

  await supabase
    .from("quotes")
    .update({
      status: "aprovado",
      approved_by_name: approverName,
      approved_at: new Date().toISOString(),
    })
    .eq("id", quote!.id);

  redirect(`/aprovar/orcamento/${token}`);
}

export async function rejectQuote(formData: FormData) {
  const token = String(formData.get("token"));
  const reason = String(formData.get("rejection_reason") || "").trim();

  const supabase = createAdminClient();

  const { data: quote } = await supabase.from("quotes").select("id").eq("approval_token", token).single();
  if (!quote) redirect(`/aprovar/orcamento/${token}?erro=${encodeURIComponent("Link inválido.")}`);

  await supabase
    .from("quotes")
    .update({
      status: "rejeitado",
      rejection_reason: reason || null,
    })
    .eq("id", quote!.id);

  redirect(`/aprovar/orcamento/${token}`);
}
