import { supabase } from "@/integrations/supabase/client";

export const addPoints = async (userId: string, points: number, actionType: string) => {
  try {
    const { error } = await supabase.rpc("add_user_points", {
      p_user_id: userId,
      p_points: points,
      p_action_type: actionType,
    });

    if (error) {
      console.error("Error adding points", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception adding points:", err);
    return false;
  }
};

export const getPoints = async (userId: string) => {
  const { data } = await supabase
    .from("user_points")
    .select("points_total")
    .eq("user_id", userId)
    .single();

  return data?.points_total || 0;
};

export const getBadges = async (userId: string) => {
  const { data } = await supabase
    .from("user_badges")
    .select("badge_key, awarded_at")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });

  return data || [];
};

export const getLeaderboard = async (limit = 10) => {
  const { data } = await supabase
    .from("user_points")
    .select(`
      user_id,
      points_total,
      profiles:user_id(full_name)
    `)
    .order("points_total", { ascending: false })
    .limit(limit);

  return data || [];
};

