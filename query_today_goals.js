import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Query if there is a unique constraint on goals (streak_id, date)
  // Since we cannot run raw SQL directly, we can try to insert a duplicate and see if it fails due to a unique constraint!
  // That is the most direct test!
  const userId = "RWfmh08rg9cKdr5rmxNG23zI29l2";
  const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-user-id": userId
      }
    }
  });

  const duplicateGoal = {
    id: `temp_dup_${Date.now()}`,
    user_id: userId,
    title: "Gym",
    streak_id: "sg1781885444207",
    date: "2026-06-20",
    completed: false
  };

  console.log("Attempting to insert a duplicate streak goal to test uniqueness constraint...");
  const { error } = await authSupabase.from("goals").insert(duplicateGoal);

  if (error) {
    console.log("Insert failed as expected! Error message:", error.message);
    if (error.message.includes("unique_streak_goal_per_day") || error.code === "23505") {
      console.log("SUCCESS: The unique constraint (streak_id, date) is active and enforced by the database!");
    } else {
      console.log("Insert failed for a different reason:", error);
    }
  } else {
    console.log("WARNING: The duplicate insert succeeded! This means the unique constraint (streak_id, date) is NOT active in the database!");
    // Delete it so we don't leave it there
    await authSupabase.from("goals").delete().eq("id", duplicateGoal.id);
  }
}

main();
