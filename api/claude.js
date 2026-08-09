export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { system, messages, max_tokens } = req.body;
    const msgs = [];
    if (system) msgs.push({ role: 'system', content: system });
    msgs.push(...messages);
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://renanbarmell.com.br',
        'X-Title': 'PRF REVERSO'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-9b-v2:free',
        messages: msgs,
        max_tokens: max_tokens || 8000
      })
    });
    const data = await r.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ content: [{ type: 'text', text }] });
  } catch(e) {
    res.status(500).json({ error: { message: e.message } });
  }
}
