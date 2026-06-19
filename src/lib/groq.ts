export async function callGroqAPI(
  prompt: string,
  systemPrompt: string,
  apiKey: string,
  preferredModel?: string
) {
  if (!apiKey) throw new Error("Groq API key is missing.");

  // Allowed models in priority order of preference
  const fallbackModels = [
    "openai/gpt-oss-120b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "llama-3.1-8b-instant"
  ];

  // Build the list of models to try
  const modelsToTry: string[] = [];
  if (preferredModel) {
    modelsToTry.push(preferredModel);
  }
  
  fallbackModels.forEach(m => {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  });

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Hactiq Coach: Attempting query with model ${model}`);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err: any) {
      console.warn(`Hactiq Coach: Call failed with model ${model} (${err.message}). Trying next fallback...`);
      lastError = err;
    }
  }

  throw new Error(`Hactiq Coach: All models failed. Last error: ${lastError?.message || "Unknown error"}`);
}

// 1. Natural Language Goal Entry
export async function parseNLGoal(text: string, apiKey: string) {
  const systemPrompt = `You are a goal parsing assistant. Extract the goal title, category (Health, Work, Personal, Learning, Other), and priority (low, medium, high) from the user's input. Return ONLY a valid JSON object with keys "title", "category", and "priority". If category/priority are not obvious, guess based on context.`;
  const result = await callGroqAPI(text, systemPrompt, apiKey);
  try {
    const parsed = JSON.parse(result);
    return {
      title: parsed.title || text,
      category: ["Health", "Work", "Personal", "Learning", "Other"].includes(parsed.category) ? parsed.category : "Other",
      priority: ["low", "medium", "high"].includes(parsed.priority?.toLowerCase()) ? parsed.priority.toLowerCase() : "medium"
    };
  } catch (e) {
    throw new Error("Failed to parse AI response");
  }
}

// 2. Auto-categorization
export async function suggestCategory(title: string, apiKey: string) {
  const systemPrompt = `Categorize the following goal into exactly one of these categories: Health, Work, Personal, Learning, Other. Return ONLY the category name as a single word.`;
  const result = await callGroqAPI(title, systemPrompt, apiKey, "llama-3.1-8b-instant");
  const cleaned = result.trim().replace(/[^a-zA-Z]/g, '');
  if (["Health", "Work", "Personal", "Learning", "Other"].includes(cleaned)) return cleaned;
  return "Other";
}

// 3. Daily AI Briefing
export async function generateBriefing(recentGoals: any[], recentMetadata: any, apiKey: string) {
  const systemPrompt = `You are a productivity coach. Given the user's last 7 days of goals and mood/energy data, provide a 2-3 sentence actionable briefing. Keep it encouraging and specific. Do not use markdown formatting.`;
  const data = JSON.stringify({ goals: recentGoals, metadata: recentMetadata });
  return await callGroqAPI(data, systemPrompt, apiKey);
}

// 4. Smart Rescheduling
export async function suggestReschedule(goalTitle: string, recentEnergy: string, apiKey: string) {
  const systemPrompt = `The user failed to complete the goal: "${goalTitle}". Their recent energy level is ${recentEnergy}. Suggest in ONE short sentence whether they should "carry forward" to today, "reprioritize", or "break down" the goal.`;
  return await callGroqAPI(goalTitle, systemPrompt, apiKey, "llama-3.1-8b-instant");
}

// 5. Auto-Reflection on Complete
export async function generateReflection(goalTitle: string, apiKey: string) {
  const systemPrompt = `The user just completed the goal: "${goalTitle}". Generate a one-sentence positive reflection or insight they might have about this.`;
  return await callGroqAPI(goalTitle, systemPrompt, apiKey, "llama-3.1-8b-instant");
}

// 6. AI Insights in Stats
export async function generateInsights(goalsData: any[], apiKey: string) {
  const systemPrompt = `Analyze this 30-day goal data. Find weak categories and provide exactly 3 bullet points with brief actionable advice to improve their completion streak.`;
  return await callGroqAPI(JSON.stringify(goalsData), systemPrompt, apiKey);
}

// 9. Goal Decomposition
export async function decomposeGoal(goalTitle: string, apiKey: string) {
  const systemPrompt = `Break down the following goal into 3-5 actionable subtasks. Return ONLY a valid JSON array of strings.`;
  const result = await callGroqAPI(goalTitle, systemPrompt, apiKey);
  try {
    return JSON.parse(result);
  } catch (e) {
    throw new Error("Failed to parse subtasks");
  }
}

// 10. Predictive Streak Alert
export async function predictStreakBreak(goalsData: any[], todayEnergy: string, apiKey: string) {
  const systemPrompt = `Based on the user's historical completion data and today's energy (${todayEnergy}), output ONLY a number from 0 to 100 representing the percentage chance they will fail their goals tomorrow and break their streak. Just the number.`;
  const result = await callGroqAPI(JSON.stringify(goalsData), systemPrompt, apiKey, "llama-3.1-8b-instant");
  return parseInt(result.replace(/[^0-9]/g, '')) || 0;
}
