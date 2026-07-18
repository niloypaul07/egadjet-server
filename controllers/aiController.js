const OpenAI = require('openai');
const Gadget = require('../models/Gadget');

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildCatalogContext = (gadgets) =>
  gadgets
    .map(
      (g) =>
        `- ${g.title} (${g.brand}, ${g.category}): $${g.price}, Rating ${g.rating}/5, ${g.shortDescription}`
    )
    .join('\n');

const getFallbackResponse = (message, gadgets) => {
  const lower = message.toLowerCase();
  const budgetMatch = lower.match(/(\d+)/);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;

  let matches = gadgets;

  if (budget) {
    matches = gadgets.filter((g) => g.price <= budget);
  }

  if (lower.includes('laptop')) {
    matches = matches.filter((g) => g.category === 'Laptops');
  } else if (lower.includes('phone') || lower.includes('smartphone')) {
    matches = matches.filter((g) => g.category === 'Smartphones');
  } else if (lower.includes('audio') || lower.includes('headphone') || lower.includes('earbud')) {
    matches = matches.filter((g) => g.category === 'Audio');
  } else if (lower.includes('gaming')) {
    matches = matches.filter((g) => g.category === 'Gaming');
  }

  matches = matches.sort((a, b) => b.rating - a.rating).slice(0, 3);

  if (matches.length === 0) {
    return {
      reply:
        'I could not find exact matches in our catalog. Try browsing the Explore page or adjust your budget and category preferences.',
      recommendations: gadgets.slice(0, 3).map((g) => ({
        id: g._id,
        title: g.title,
        price: g.price,
        imageUrl: g.imageUrl,
        rating: g.rating,
      })),
    };
  }

  const list = matches.map((g) => `**${g.title}** ($${g.price}) — ${g.shortDescription}`).join('\n\n');

  return {
    reply: `Based on your request, here are my top recommendations from eGadjet:\n\n${list}\n\nWould you like a detailed comparison or help choosing between these?`,
    recommendations: matches.map((g) => ({
      id: g._id,
      title: g.title,
      price: g.price,
      imageUrl: g.imageUrl,
      rating: g.rating,
    })),
  };
};

const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const gadgets = await Gadget.find().sort({ rating: -1 }).limit(30);
    const catalog = buildCatalogContext(gadgets);
    const openai = getOpenAIClient();

    if (!openai) {
      const fallback = getFallbackResponse(message, gadgets);
      return res.json({ success: true, data: { ...fallback, mode: 'fallback' } });
    }

    const systemPrompt = `You are eGadjet AI, an expert shopping assistant for a premium gadget ecommerce store in Bangladesh.
Your role:
1. Help customers find the right gadgets based on budget, use case, and preferences.
2. Compare products objectively using the catalog data provided.
3. Explain technical specs in simple language.
4. Always recommend specific products from the catalog when relevant.
5. Be friendly, concise, and professional.

Current catalog:
${catalog}

When recommending products, mention exact product names from the catalog. If asked about products not in the catalog, politely suggest similar alternatives from the catalog.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content || 'I am here to help you find the perfect gadget.';

    const recommendedTitles = gadgets
      .filter((g) => reply.toLowerCase().includes(g.title.toLowerCase().split(' ')[0]))
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        reply,
        recommendations: recommendedTitles.map((g) => ({
          id: g._id,
          title: g.title,
          price: g.price,
          imageUrl: g.imageUrl,
          rating: g.rating,
        })),
        mode: 'ai',
      },
    });
  } catch (error) {
    const gadgets = await Gadget.find().sort({ rating: -1 }).limit(30);
    const fallback = getFallbackResponse(req.body.message || '', gadgets);
    res.json({ success: true, data: { ...fallback, mode: 'fallback' } });
  }
};

module.exports = { chatWithAssistant };
