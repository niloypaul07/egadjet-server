const Groq = require('groq-sdk');
const Gadget = require('../models/Gadget');

const getGroqClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your-groq-api-key') return null;
  return new Groq({ apiKey: key });
};

const buildCatalogContext = (gadgets) =>
  gadgets
    .map(
      (g) =>
        `- ${g.title} (${g.brand}, ${g.category}): $${g.price}, Rating ${g.rating}/5, Stock: ${g.stock}, ${g.shortDescription}`
    )
    .join('\n');

const buildSystemPrompt = (catalog) => `You are eGadjet AI, an expert shopping assistant for a premium gadget ecommerce store.

Your capabilities:
1. Help customers find the right gadgets based on budget, use case, and preferences.
2. Compare products objectively using the catalog data provided.
3. Explain technical specs in simple, friendly language.
4. Always recommend specific products from the catalog when relevant.
5. Assist with navigation (e.g. "go to explore page", "view cart").
6. Understand follow-up questions using conversation history.

Current product catalog:
${catalog}

Response rules:
- Be concise, friendly, and helpful.
- Use bullet points for comparisons and lists.
- Always suggest products from the catalog by exact name.
- End responses with a helpful follow-up question when appropriate.
- If asked about something outside gadgets, politely redirect to shopping assistance.`;

const getFollowUpSuggestions = (message, reply) => {
  const lower = (message + ' ' + reply).toLowerCase();

  if (lower.includes('laptop')) {
    return ['What specs should I look for?', 'Compare the top laptops', 'Best laptop for students?'];
  } else if (lower.includes('phone') || lower.includes('smartphone') || lower.includes('iphone') || lower.includes('samsung')) {
    return ['Which has better camera?', 'Compare battery life', 'Best phone under $1000?'];
  } else if (lower.includes('headphone') || lower.includes('airpod') || lower.includes('audio') || lower.includes('noise')) {
    return ['Which has better noise cancellation?', 'Best for commuting?', 'Wired vs wireless?'];
  } else if (lower.includes('gaming') || lower.includes('playstation') || lower.includes('xbox')) {
    return ['Best gaming accessories?', 'PS5 vs Xbox?', 'Gaming laptop recommendations?'];
  } else if (lower.includes('watch') || lower.includes('wearable')) {
    return ['Apple Watch vs others?', 'Best fitness tracker?', 'Smartwatch battery life comparison'];
  }
  return ['Show me the best rated products', "What's new in stock?", 'Best gadgets under $500?'];
};

// Score a gadget against the user message
const scoreGadget = (gadget, lower) => {
  let score = 0;
  const fields = [gadget.title, gadget.brand, gadget.category, gadget.shortDescription]
    .map((f) => (f || '').toLowerCase());

  for (const field of fields) {
    for (const word of field.split(/\s+/)) {
      if (word.length > 2 && lower.includes(word)) score += 3;
    }
  }

  const categoryMap = {
    Laptops: ['laptop', 'notebook', 'macbook', 'xps', 'zephyrus', 'computer', 'pc', 'video editing', 'coding', 'work laptop'],
    Smartphones: ['phone', 'smartphone', 'iphone', 'galaxy', 'pixel', 'mobile', 'android'],
    Audio: ['headphone', 'earbud', 'airpod', 'earphone', 'noise cancel', 'noise-cancel', 'wh-1000', 'audio', 'sound', 'music', 'listen', 'travel'],
    Wearables: ['watch', 'smartwatch', 'wearable', 'fitness', 'band', 'apple watch', 'health tracking'],
    Gaming: ['gaming', 'game', 'playstation', 'ps5', 'xbox', 'console', 'controller', 'gamer'],
    Accessories: ['mouse', 'keyboard', 'accessory', 'accessories', 'mx master', 'logitech', 'peripheral'],
    'Smart Home': ['smart home', 'echo', 'alexa', 'speaker', 'smart display', 'home automation'],
  };

  const keywords = categoryMap[gadget.category] || [];
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 8;
  }

  const budgetMatch = lower.match(/\$?(\d{2,5})/g);
  if (budgetMatch) {
    const maxBudget = Math.max(...budgetMatch.map((b) => Number(b.replace('$', ''))));
    if (gadget.price <= maxBudget) score += 4;
    if (gadget.price > maxBudget) score -= 6;
  }

  score += gadget.rating * 0.5;
  return score;
};

const getFallbackResponse = (message, gadgets) => {
  const lower = message.toLowerCase();
  const scored = gadgets
    .map((g) => ({ gadget: g, score: scoreGadget(g, lower) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const matches = scored.slice(0, 3).map((s) => s.gadget);

  const isCompare = /compare|vs|versus|difference|better/.test(lower);
  const isBudget = /under|below|less than|budget|\$\d+/.test(lower);
  const isBest = /best|top|recommend/.test(lower);

  if (matches.length === 0) {
    return {
      reply: "I couldn't find a perfect match in our current catalog. Here are our top-rated products:",
      recommendations: gadgets.sort((a, b) => b.rating - a.rating).slice(0, 3)
        .map((g) => ({ id: g._id, title: g.title, price: g.price, imageUrl: g.imageUrl, rating: g.rating })),
      followUps: ['Show all categories', 'Best rated products?', 'What gadgets do you have?'],
    };
  }

  let intro = isCompare && matches.length >= 2
    ? "Here's a comparison from our catalog:\n\n"
    : isBudget ? "Here are the best options within your budget:\n\n"
    : isBest ? "Here are my top picks for your request:\n\n"
    : "Here are the most relevant products I found:\n\n";

  const list = matches
    .map((g) => `• **${g.title}** (${g.brand}) — $${g.price} | ⭐ ${g.rating}\n  ${g.shortDescription}`)
    .join('\n\n');

  const outro = isCompare && matches.length >= 2
    ? '\n\nWould you like me to go deeper on any specific feature like camera, battery, or performance?'
    : '\n\nWould you like more details on any of these, or shall I refine the search?';

  return {
    reply: intro + list + outro,
    recommendations: matches.map((g) => ({ id: g._id, title: g.title, price: g.price, imageUrl: g.imageUrl, rating: g.rating })),
    followUps: getFollowUpSuggestions(message, list),
  };
};

// Regular (non-streaming) chat
const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    const gadgets = await Gadget.find().sort({ rating: -1 }).limit(30);
    const catalog = buildCatalogContext(gadgets);
    const groq = getGroqClient();

    if (!groq) {
      const fallback = getFallbackResponse(message, gadgets);
      return res.json({ success: true, data: { ...fallback, mode: 'fallback' } });
    }

    let reply, recommendations, followUps;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(catalog) },
          ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      reply = completion.choices[0]?.message?.content || "I'm here to help you find the perfect gadget!";
      recommendations = gadgets
        .filter((g) => reply.toLowerCase().includes(g.title.toLowerCase().split(' ')[0]))
        .slice(0, 3)
        .map((g) => ({ id: g._id, title: g.title, price: g.price, imageUrl: g.imageUrl, rating: g.rating }));
      followUps = getFollowUpSuggestions(message, reply);
    } catch (aiError) {
      console.error('Groq chat error:', aiError.message);
      const fallback = getFallbackResponse(message, gadgets);
      reply = fallback.reply;
      recommendations = fallback.recommendations;
      followUps = fallback.followUps;
    }

    res.json({ success: true, data: { reply, recommendations, followUps, mode: 'ai' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Streaming chat via SSE
const chatWithAssistantStream = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    const gadgets = await Gadget.find().sort({ rating: -1 }).limit(30);
    const catalog = buildCatalogContext(gadgets);
    const groq = getGroqClient();

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    if (!groq) {
      const fallback = getFallbackResponse(message, gadgets);
      for (const word of fallback.reply.split(' ')) {
        sendEvent('delta', { text: word + ' ' });
        await new Promise((r) => setTimeout(r, 20));
      }
      sendEvent('recommendations', { items: fallback.recommendations });
      sendEvent('followUps', { items: fallback.followUps });
      sendEvent('done', { mode: 'fallback' });
      return res.end();
    }

    try {
      const stream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: buildSystemPrompt(catalog) },
          ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });

      let fullReply = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          fullReply += delta;
          sendEvent('delta', { text: delta });
        }
      }

      const recommendations = gadgets
        .filter((g) => fullReply.toLowerCase().includes(g.title.toLowerCase().split(' ')[0]))
        .slice(0, 3)
        .map((g) => ({ id: g._id, title: g.title, price: g.price, imageUrl: g.imageUrl, rating: g.rating }));

      sendEvent('recommendations', { items: recommendations });
      sendEvent('followUps', { items: getFollowUpSuggestions(message, fullReply) });
      sendEvent('done', { mode: 'ai' });
      res.end();
    } catch (aiError) {
      console.error('Groq stream error:', aiError.message);
      // Graceful fallback — stream catalog response
      const fallback = getFallbackResponse(message, gadgets);
      for (const word of fallback.reply.split(' ')) {
        sendEvent('delta', { text: word + ' ' });
        await new Promise((r) => setTimeout(r, 20));
      }
      sendEvent('recommendations', { items: fallback.recommendations });
      sendEvent('followUps', { items: fallback.followUps });
      sendEvent('done', { mode: 'fallback' });
      res.end();
    }
  } catch (error) {
    console.error('AI stream fatal error:', error.message);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Something went wrong. Please try again.' })}\n\n`);
      res.end();
    } catch {}
  }
};

module.exports = { chatWithAssistant, chatWithAssistantStream };
