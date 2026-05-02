export type WorkflowLevel = "urgent" | "warning" | "ok" | "archived";

export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(date?: string | null) {
  if (!date) return null;

  const today = new Date(getTodayISO());
  const target = new Date(date);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function getOpenChecklistCount(checklist: any) {
  if (!checklist) return 0;

  if (Array.isArray(checklist)) {
    return checklist.filter((item) => !item.done).length;
  }

  if (typeof checklist === "object") {
    return Object.values(checklist).filter((value) => value === false).length;
  }

  return 0;
}

export function getWorkflowLevel(show: any): WorkflowLevel {
  const internalStatus = show.show_admin_notes?.internal_status;
  const billingStatus = show.show_admin_notes?.billing_status;
  const followUpDate = show.show_admin_notes?.follow_up_date;
  const checklist = show.show_admin_notes?.checklist;

  const daysToShow = daysUntil(show.show_date);
  const daysToFollowUp = daysUntil(followUpDate);
  const openChecklist = getOpenChecklistCount(checklist);

  if (internalStatus === "archiviert" || internalStatus === "abgeschlossen") {
    return "archived";
  }

  if (daysToFollowUp !== null && daysToFollowUp <= 0) {
    return "urgent";
  }

  if (
    daysToShow !== null &&
    daysToShow <= 14 &&
    daysToShow >= 0 &&
    openChecklist > 0
  ) {
    return "urgent";
  }

  if (
    billingStatus === "offen" &&
    daysToShow !== null &&
    daysToShow < 0
  ) {
    return "urgent";
  }

  if (internalStatus === "wartet_auf_veranstalter") {
    return "warning";
  }

  if (openChecklist > 0) {
    return "warning";
  }

  return "ok";
}

export function getNextAction(show: any) {
  const admin = show.show_admin_notes;
  const details = show.show_details;

  if (admin?.next_step) return admin.next_step;

  if (!details?.contact_email) return "Kontakt ergänzen";
  if (!details?.venue_address) return "Adresse ergänzen";
  if (!details?.schedule) return "Ablauf klären";
  if (!details?.technik) return "Technikdaten nachfassen";
  if (!details?.vertrag) return "Vertrag prüfen";
  if (!details?.tickets) return "Ticketlink ergänzen";

  if (admin?.billing_status === "offen") return "Abrechnung erledigen";

  return "Keine offene Aktion";
}

export function formatDate(date?: string | null) {
  if (!date) return "ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}