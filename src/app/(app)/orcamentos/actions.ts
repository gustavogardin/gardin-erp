"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

type ItemInput = {
  name: string;
  measurements: string;
  quantity: number;
  technical_description: string;
  unit_value: number;
  needs_art: boolean;
  needs_printing: boolean;
  needs_production: boolean;
  needs_installation: boolean;
  art_already_approved: boolean;
};

export async function createQuote(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clientId = String(formData.get("client_id") || "");
  const title = String(formData.get("title") || "");
  const serviceSummary = String(formData.get("service_summary") || "") || null;
  const finishing = String(formData.get("finishing") || "") || null;
  const validUntil = String(formData.get("valid_until") || "") || null;
  const deadlineEstimate = String(formData.get("deadline_estimate") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  if (!clientId || !title) {
    redirect(`/orcamentos/novo?erro=${encodeURIComponent("Cliente e título são obrigatórios.")}`);
  }

  const itemsJson = String(formData.get("items_json") || "[]");
  let items: ItemInput[] = [];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    items = [];
  }
  items = items.filter((i) => i.name && i.name.trim());

  if (items.length === 0) {
    redirect(`/orcamentos/novo?erro=${encodeURIComponent("Adicione pelo menos um item.")}`);
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      client_id: clientId,
      title,
      service_summary: serviceSummary,
      finishing,
      valid_until: validUntil,
      deadline_estimate: deadlineEstimate,
      notes,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/orcamentos/novo?erro=${encodeURIComponent(error.message)}`);
  }

  const quoteId = quote!.id;

  const rows = items.map((item, index) => ({
    quote_id: quoteId,
    name: item.name,
    measurements: item.measurements || null,
    quantity: item.quantity || 1,
    technical_description: item.technical_description || null,
    unit_value: item.unit_value || 0,
    needs_art: !!item.needs_art,
    needs_printing: !!item.needs_printing,
    needs_production: !!item.needs_production,
    needs_installation: !!item.needs_installation,
    art_already_approved: !!item.art_already_approved,
    sort_order: index,
  }));

  await supabase.from("quote_items").insert(rows);

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${quoteId}`);
}

export async function generateApprovalLink(formData: FormData) {
  const supabase = createClient();
  const quoteId = String(formData.get("quote_id"));

  const token = randomBytes(16).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await supabase
    .from("quotes")
    .update({
      approval_token: token,
      approval_token_expires_at: expiresAt.toISOString(),
      status: "enviado",
    })
    .eq("id", quoteId);

  revalidatePath(`/orcamentos/${quoteId}`);
  redirect(`/orcamentos/${quoteId}`);
}

export async function convertQuoteToOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const quoteId = String(formData.get("quote_id"));

  const { data: quote } = await supabase.from("quotes").select("*").eq("id", quoteId).single();
  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("sort_order");

  if (!quote || !items || items.length === 0) {
    redirect(`/orcamentos/${quoteId}?erro=${encodeURIComponent("Orçamento sem itens.")}`);
  }

  const needsArt = items!.some((i) => i.needs_art && !i.art_already_approved);
  const needsPrinting = items!.some((i) => i.needs_printing);
  const needsProduction = items!.some((i) => i.needs_production);
  const needsInstallation = items!.some((i) => i.needs_installation);
  const totalValue = items!.reduce((sum, i) => sum + Number(i.unit_value) * Number(i.quantity), 0);

  const description = items!
    .map((i) => `${i.name}${i.measurements ? ` (${i.measurements})` : ""} — Qtd: ${i.quantity}`)
    .join("\n");

  const currentStage = needsArt
    ? "arte"
    : needsPrinting
    ? "impressao"
    : needsProduction
    ? "producao"
    : needsInstallation
    ? "instalacao"
    : "financeiro";

  const { data: order, error } = await supabase
    .from("service_orders")
    .insert({
      client_id: quote!.client_id,
      project_name: quote!.title,
      description,
      needs_art: needsArt,
      needs_printing: needsPrinting,
      needs_production: needsProduction,
      needs_installation: needsInstallation,
      current_stage: currentStage,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/orcamentos/${quoteId}?erro=${encodeURIComponent(error.message)}`);
  }

  const orderId = order!.id;

  await supabase.from("financials").insert({
    service_order_id: orderId,
    total_value: totalValue,
    status: "nao_cobrado",
  });

  if (needsPrinting) await supabase.from("print_jobs").insert({ service_order_id: orderId, status: "aguardando" });
  if (needsProduction)
    await supabase.from("production_jobs").insert({ service_order_id: orderId, status: "aguardando" });
  if (needsInstallation)
    await supabase.from("installations").insert({ service_order_id: orderId, status: "aguardando_agendamento" });

  await supabase.from("quotes").update({ converted_order_id: orderId }).eq("id", quoteId);

  revalidatePath("/orcamentos");
  revalidatePath("/ordens");
  revalidatePath("/dashboard");
  redirect(`/ordens/${orderId}`);
}
