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
const userId = "RWfmh08rg9cKdr5rmxNG23zI29l2";

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-user-id": userId
      }
    }
  });

  // 1. Fetch active streaks
  const { data: streaks, error: streaksError } = await supabase
    .from("streak_goals")
    .select("id");

  if (streaksError) {
    console.error("Error fetching active streaks:", streaksError.message);
    return;
  }
  const activeStreakIds = new Set(streaks.map(s => s.id));
  console.log("Active Streak IDs:", Array.from(activeStreakIds));

  // 2. Fetch all goals
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("*");

  if (goalsError) {
    console.error("Error fetching goals:", goalsError.message);
    return;
  }
  console.log(`Fetched ${goals.length} goals.`);

  const todayStr = "2026-06-20";
  const toDeleteIds = [];
  let orphanedCount = 0;
  let futureCount = 0;
  let duplicateCount = 0;

  // Group goals for duplicate checking and inspect each goal
  const groups = {};

  goals.forEach(g => {
    if (!g.streak_id) return; // Ignore manual goals

    // A. Check if orphaned (streak_id is not in active streaks)
    if (!activeStreakIds.has(g.streak_id)) {
      toDeleteIds.push(g.id);
      orphanedCount++;
      console.log(`Orphaned goal identified: '${g.title}' (ID: ${g.id}, Streak ID: ${g.streak_id})`);
      return;
    }

    // B. Check if future-dated (date > today)
    if (g.date > todayStr) {
      toDeleteIds.push(g.id);
      futureCount++;
      return;
    }

    // C. Group for duplicate checking (only for active streaks today or in the past)
    const key = `${g.streak_id}_${g.date}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(g);
  });

  // Check duplicate groups
  Object.keys(groups).forEach(key => {
    const group = groups[key];
    if (group.length > 1) {
      // Sort: completed DESC, then created_at ASC
      group.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      // Keep group[0], delete the rest
      const rest = group.slice(1);
      rest.forEach(r => {
        toDeleteIds.push(r.id);
        duplicateCount++;
        console.log(`Duplicate goal identified: '${r.title}' on ${r.date} (ID: ${r.id}, Keep ID: ${group[0].id})`);
      });
    }
  });

  const uniqueDeleteIds = [...new Set(toDeleteIds)];
  console.log(`\nTotal unique goals identified for deletion: ${uniqueDeleteIds.length}`);
  console.log(`- Orphaned: ${orphanedCount}`);
  console.log(`- Future-dated: ${futureCount}`);
  console.log(`- Duplicates: ${duplicateCount}`);

  if (uniqueDeleteIds.length > 0) {
    console.log(`Executing delete query in Supabase...`);
    const { error: deleteError } = await supabase
      .from("goals")
      .delete()
      .in("id", uniqueDeleteIds);

    if (deleteError) {
      console.error("Error executing delete:", deleteError.message);
    } else {
      console.log("Cleanup executed successfully!");
    }
  } else {
    console.log("No goals to delete.");
  }
}

main();
