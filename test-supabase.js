import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env file
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

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTable(name) {
  try {
    const { data, error } = await supabase.from(name).select("*").limit(1);
    if (error) {
      console.error(`Error querying table ${name}:`, error.message);
    } else {
      console.log(`Success querying table ${name}:`, data);
    }
  } catch (err) {
    console.error(`Caught error querying table ${name}:`, err);
  }
}

async function main() {
  const tables = [
    "boards",
    "columns",
    "tasks",
    "goals",
    "streak_goals",
    "goal_templates",
    "goal_template_items",
    "day_metadata",
    "activities",
    "user_preferences"
  ];
  for (const table of tables) {
    await testTable(table);
  }
}
main();
