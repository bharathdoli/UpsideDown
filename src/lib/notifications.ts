import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "note_new"
  | "event_new"
  | "event_rsvp"
  | "listing_new"
  | "study_buddy_new"
  | "alumni_new"
  | "issue_new"
  | "issue_resolved";

export const createNotificationForUser = async (
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string
) => {
  try {
    const { data, error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      link: link ?? null,
    }).select("id").single();

    if (error) {
      console.error("Error creating notification", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return false;
    }
    console.log("Notification created successfully:", data?.id);
    return true;
  } catch (err) {
    console.error("Exception creating notification:", err);
    return false;
  }
};


