export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { prompt } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

  try {
    let code = "";
    // 1. Pehle Gemini try karo (Free hai, Fast hai)
    if (GEMINI_KEY) {
      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Create a React component for: ${prompt}. Return ONLY clean JSX code, no explanation.` }] }] })
      });
      const gData = await gRes.json();
      code = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    // 2. Agar Gemini fail to OpenAI try karo
    if (!code && OPENAI_KEY) {
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a React developer. Return ONLY clean JSX code." },
            { role: "user", content: prompt }
          ]
        })
      });
      const aiData = await aiRes.json();
      code = aiData.choices?.[0]?.message?.content || "";
    }
    if (!code) throw new Error("API Key kaam nahi kar rahi. Vercel me GEMINI_API_KEY check karo");

    // Code saaf karo (```jsx hatao)
    code = code.replace(/```jsx|```javascript|```js|```/g, "").trim();

    // 3. GitHub me file banao
    const fileName = prompt.replace(/[^a-zA-Z0-9]/g, '-').substring(0,20) + '-' + Date.now();
    const path = `frontend/src/features/${fileName}.jsx`;
    const content = Buffer.from(code).toString('base64');

    await fetch(`https://api.github.com/repos/maheshchandra10/bharat-app-builder/contents/${path}`, {
      method: "PUT",
      headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `AI: Added ${prompt}`, content, branch: "main" })
    });

    return res.status(200).json({ success: true, response: code, message: `✅ Feature "${prompt}" App me add kar diya!` });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
}
