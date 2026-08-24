"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/profile";

export async function createServiceOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsArt = formData.get("needs_art") === "on";
  const needsPrinting = formData.get("needs_printing") === "on";
  const needsProduction = formData.get("needs_production") === "on";
  const needsInstallation = formData.get("needs_installation") === "on";

  const totalValue = Number(formData.get("total_value") || 0);

  const payload = {
    client_id: String(formData.get("client_id") || ""),
    project_name: String(formData.get("project_name") || ""),
    description: String(formData.get("description") || "") || null,
    quantity: formData.get("quantity") ? Number(formData.get("quantity")) : null,
    measurements: String(formData.get("measurements") || "") || null,
    material: String(formData.get("material") || "") || null,
    agreed_deadline: String(formData.get("agreed_deadline") || "") || null,
    expected_completion_date: String(formData.get("expected_completion_date") || "") || null,
    priority: String(formData.get("priority") || "normal"),
    needs_art: needsArt,
    needs_printing: needsPrinting,
    needs_production: needsProduction,
    needs_installation: needsInstallation,
    current_stage: needsArt ? "arte" : needsPrinting ? "impressao" : needsProduction ? "producao" : needsInstallation ? "instalacao" : "financeiro",
    created_by: user?.id ?? null,
  };

  if (!payload.client_id || !payload.project_name) {
    redirect(`/ordens/nova?erro=${encodeURIComponent("Cliente e nome do projeto são obrigatórios.")}`);
  }

  const { data: order, error } = await supabase
    .from("service_orders")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    redirect(`/ordens/nova?erro=${encodeURIComponent(error.message)}`);
  }

  const orderId = order!.id;

  // cria a linha financeira
  await supabase.from("financials").insert({
    service_order_id: orderId,
    total_value: totalValue,
    status: "nao_cobrado",
  });

  // cria registros de apoio para cada etapa selecionada
  if (needsArt) {
    await supabase.from("service_order_steps").insert({
      service_order_id: orderId,
      stage: "arte",
      status: "aguardando",
    });
  }
  if (needsPrinting) {
    await supabase.from("print_jobs").insert({ service_order_id: orderId, status: "aguardando" });
  }
  if (needsProduction) {
    await supabase.from("production_jobs").insert({ service_order_id: orderId, status: "aguardando" });
  }
  if (needsInstallation) {
    await supabase.from("installations").insert({ service_order_id: orderId, status: "aguardando_agendamento" });
  }

  revalidatePath("/ordens");
  revalidatePath("/dashboard");
  redirect(`/ordens/${orderId}`);
}

export async function updateServiceOrderStage(formData: FormData) {
  const supabase = createClient();
  const orderId = String(formData.get("order_id"));
  const newStage = String(formData.get("stage"));
  const isCompleted = newStage === "concluido";

  await supabase
    .from("service_orders")
    .update({ current_stage: newStage, is_completed: isCompleted, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath(`/ordens/${orderId}`);
  revalidatePath("/dashboard");
  redirect(`/ordens/${orderId}`);
}

export async function updateServiceOrder(formData: FormData) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const orderId = String(formData.get("order_id"));

  const payload = {
    project_name: String(formData.get("project_name") || ""),
    description: String(formData.get("description") || "") || null,
    quantity: formData.get("quantity") ? Number(formData.get("quantity")) : null,
    measurements: String(formData.get("measurements") || "") || null,
    material: String(formData.get("material") || "") || null,
    agreed_deadline: String(formData.get("agreed_deadline") || "") || null,
    expected_completion_date: String(formData.get("expected_completion_date") || "") || null,
    priority: String(formData.get("priority") || "normal"),
    updated_at: new Date().toISOString(),
  };

  if (!payload.project_name) {
    redirect(`/ordens/${orderId}/editar?erro=${encodeURIComponent("Nome do projeto é obrigatório.")}`);
  }

  const { error } = await supabase.from("service_orders").update(payload).eq("id", orderId);

  if (error) {
    redirect(`/ordens/${orderId}/editar?erro=${encodeURIComponent(error.message)}`);
  }

  // financeiro: só atualiza se o usuário tiver permissão para ver/editar valores
  if (profile?.canViewFinancials) {
    const totalValue = Number(formData.get("total_value") || 0);
    const discount = Number(formData.get("discount") || 0);
    const addition = Number(formData.get("addition") || 0);
    const status = String(formData.get("financial_status") || "nao_cobrado");

    await supabase
      .from("financials")
      .update({
        total_value: totalValue,
        discount,
        addition,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("service_order_id", orderId);
  }

  revalidatePath(`/ordens/${orderId}`);
  revalidatePath("/ordens");
  revalidatePath("/dashboard");
  redirect(`/ordens/${orderId}`);
}

export async function addComment(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orderId = String(formData.get("order_id"));
  const content = String(formData.get("content") || "").trim();

  if (content) {
    await supabase.from("comments").insert({
      service_order_id: orderId,
      author_id: user?.id ?? null,
      content,
    });
  }

  revalidatePath(`/ordens/${orderId}`);
  redirect(`/ordens/${orderId}`);
}
