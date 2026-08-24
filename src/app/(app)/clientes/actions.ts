"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createClientRecord(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    name: String(formData.get("name") || ""),
    trade_name: String(formData.get("trade_name") || "") || null,
    document: String(formData.get("document") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    address: String(formData.get("address") || "") || null,
    city: String(formData.get("city") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    created_by: user?.id ?? null,
  };

  const { error } = await supabase.from("clients").insert(payload);

  if (error) {
    redirect(`/clientes/novo?erro=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}
