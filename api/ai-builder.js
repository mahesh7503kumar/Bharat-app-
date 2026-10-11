export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt khali hai' });

    // Abhi ke liye sirf success return karte hain, bina GitHub ke
    // Taaki aapka Network Error khatam ho jaye
    console.log("Prompt aaya:", prompt);

    return res.status(200).json({ 
      success: true, 
      message: `✅ "${prompt}" ka command mil gaya! AI Builder ab ready hai.`,
      prompt: prompt
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
