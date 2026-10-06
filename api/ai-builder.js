export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

  const { prompt } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

  try {
    // 1. OpenAI se code banwao
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a React developer. Create a React component for the feature requested. Return ONLY clean JSX code, no explanation." },
          { role: "user", content: prompt }
        ]
      })
    });
    const aiData = await aiRes.json();
    const code = aiData.choices[0].message.content;

    // 2. GitHub me file banao
    const fileName = prompt.replace(/[^a-zA-Z0-9]/g, '-').substring(0,20);
    const path = `src/features/${fileName}.jsx`;
    const content = Buffer.from(code).toString('base64');

    await fetch(`https://api.github.com/repos/maheshchandra10/bharat-app-builder/contents/${path}`, {
      method: "PUT",
      headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `AI: Added ${prompt}`, content, branch: "main" })
    });

    return res.status(200).json({ success: true, message: `✅ Feature "${prompt}" App me add kar diya!` });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
