import dotenv from "dotenv";
import { callClaude, extractJson } from "./src/utils/aiHelper.js";
dotenv.config();

const prompt = (days) => `
You are an AI study planner. UPSC CSE is in ${days} days.
Create a personalized day-by-day study plan as JSON:
{
  "overview": "short summary of the plan",
  "days": [
    { "day": 1, "duration": "2 hours", "focus": "...", "tasks": ["..."], "tips": ["..."] }
  ]
}
Generate exactly ${days} days.
Return ONLY a single valid JSON object with no markdown fences and no commentary.
`;

for (const days of [7, 14, 20]) {
  try {
    const content = await callClaude(
      [{ role: "user", content: prompt(days) }],
      false,
      4096
    );
    console.log(`${days} days | len=${content.length}`);
    const parsed = extractJson(content);
    console.log(`  OK days=${parsed.days?.length}`);
  } catch (err) {
    console.log(`${days} days ERROR: ${err.message.slice(0, 150)}`);
  }
}
process.exit(0);