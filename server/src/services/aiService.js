const axios = require('axios');

/**
 * LLM chatbot. Never touches MongoDB directly.
 * Callers must pass pre-fetched, permission-scoped context.
 */
exports.chat = async ({ messages, userContext }) => {
  const systemPrompt = `You are ShramSetu Assistant, helping Indian daily-wage workers and employers.
Reply in the user's preferred language (${userContext.language || 'hi'}).
Be short, warm, and use simple words. If unsure, offer to connect to support.
User role: ${userContext.role}.
You have NO direct database access. Only respond with the context provided.`;

  // Fallback if no API key (dev mode)
  if (!process.env.LLM_API_KEY) {
    const last = messages[messages.length - 1]?.content || '';
    return {
      reply: `(demo) Aapne kaha: "${last}". Main aapki madad kar sakta hoon — kaam dhundhne, apply karne, ya support ke liye.`,
    };
  }

  const res = await axios.post(
    process.env.LLM_API_URL,
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 400,
    },
    { headers: { Authorization: `Bearer ${process.env.LLM_API_KEY}` } }
  );
  return { reply: res.data.choices[0].message.content };
};