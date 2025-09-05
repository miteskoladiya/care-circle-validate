const cron = require("node-cron");
const { Post } = require("../models/Post");
const { Community } = require("../models/Community");
const { getIo } = require("../socket");

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function generateAiContent(prompt) {
  if (!OPENAI_KEY) return `AI placeholder content for prompt: ${prompt}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 400 }),
    });
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    return content || `AI fallback content for prompt: ${prompt}`;
  } catch (err) {
    console.error("AI generation failed", err);
    return `AI fallback content for prompt: ${prompt}`;
  }
}

function initScheduler() {
  cron.schedule("0 9 * * *", async () => {
    console.log("Running scheduled AI post job");
    try {
      const communities = await Community.find().lean();
      for (const c of communities) {
        const prompt = `Write a helpful health tip for the ${c.name} community in 200 words.`;
        const content = await generateAiContent(prompt);
        const title = `${c.name} Daily Health Tip`;
        const post = await Post.create({ title, content, community: c.name, authorName: "AI Agent", aiGenerated: true, validationStatus: "pending", published: false });
        try { getIo().emit("post:ai_created", post); } catch {}
      }
    } catch (err) { console.error("Scheduler failed", err); }
  });
}

module.exports = { initScheduler };
