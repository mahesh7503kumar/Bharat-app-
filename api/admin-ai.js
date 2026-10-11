const OWNER_REPO = (process.env.GITHUB_REPO || 'mahesh7503kumar/Bharat-app-builder').trim().replace(/[\n\r]/g, '');
const DEFAULT_BRANCH = (process.env.GITHUB_BRANCH || 'main').trim();

function jsonError(res, status, error) {
  return res.status(status).json({ success: false, error });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed');

  const founderEmail = String(process.env.FOUNDER_EMAIL || process.env.REACT_APP_OWNER_EMAIL || '').trim().toLowerCase();
  const requestEmail = String(req.headers['x-founder-email'] || req.body?.email || '').trim().toLowerCase();
  if (!founderEmail || requestEmail !== founderEmail) return jsonError(res, 403, 'Founder access required');

  const command = String(req.body?.command || '').trim();
  if (!command || command.length > 2000) return jsonError(res, 400, 'Command must be 1–2000 characters');

  const openAiKey = (process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '').trim();
  if (!openAiKey) return jsonError(res, 503, 'AI service is not configured');

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openAiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant for the founder of Bharat App Builder. Help refactor code, fix bugs, improve design. Generate React + Tailwind code. Return a concise answer. If proposing files, use fenced code blocks with the exact relative path on the opening fence, for example ```frontend/src/App.js' },
          { role: 'user', content: command },
        ],
      }),
    });
    const aiData = await aiResponse.json();
    if (!aiResponse.ok) return jsonError(res, aiResponse.status, aiData?.error?.message || 'AI request failed');

    const answer = aiData?.choices?.[0]?.message?.content || 'No response generated.';
    const githubToken = (process.env.GITHUB_TOKEN || '').trim();
    const files = [...answer.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)]
      .map((match) => ({ path: match[1].trim(), content: match[2] }))
      .filter(({ path }) => /^(frontend\/src|api)\/[\w./-]+$/.test(path));

    const pushed = [];
    if (githubToken && files.length) {
      for (const file of files.slice(0, 5)) {
        const url = `https://api.github.com/repos/${OWNER_REPO}/contents/${file.path}`;
        const current = await fetch(url, { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' } });
        const currentData = current.ok ? await current.json() : null;
        const update = await fetch(url, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `AI: ${command.slice(0, 72)}`, content: Buffer.from(file.content).toString('base64'), branch: DEFAULT_BRANCH, ...(currentData?.sha ? { sha: currentData.sha } : {}) }),
        });
        if (update.ok) pushed.push(file.path);
      }
    }

    return res.status(200).json({ success: true, answer, files: pushed, committed: pushed.length > 0 });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Unexpected server error');
  }
}

export const config = { api: { bodyParser: { sizeLimit: '64kb' } } };
