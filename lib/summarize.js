const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Dohvaća tekst članka s URL-a (parsira HTML).
 */
async function extractArticleText(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'hr,en;q=0.9',
    },
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status < 500,
  });

  const $ = cheerio.load(html);
  $('script, style, nav, header, footer, .ad, .ads, iframe').remove();

  const selectors = [
    'article .content',
    'article .article-body',
    'article .text',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content-body',
    'article',
    'main',
    '.story-body',
    '[itemprop="articleBody"]',
  ];

  let text = '';
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      text = el.text().trim();
      if (text.length > 200) break;
    }
  }

  if (!text || text.length < 100) {
    text = $('body').text().trim();
  }

  return text.replace(/\s+/g, ' ').slice(0, 12000);
}

/**
 * Generira sažetak pomoću OpenAI API-ja.
 */
async function summarizeWithOpenAI(articleText) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'tvoj-api-kljuc-ovdje') {
    return {
      summary: [
        'API ključ nije postavljen.',
        'Na Vercelu: postavi OPENAI_API_KEY u Environment Variables.',
        'Lokalno: u .env dodaj OPENAI_API_KEY i ponovno pokreni server.',
      ],
      error: 'NO_API_KEY',
    };
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Sažmi sljedeći tekst vijesti na hrvatskom jeziku. Odgovor napiši isključivo kao kratke natuknice (bullet points), bez uvodnih rečenica. Svaka natuknica u jednom redu. Tekst za sažimanje:

---
${articleText}
---`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Ti si asistent koji sažima vijesti. Odgovaraš isključivo na hrvatskom jeziku, u obliku kratkih natuknica (bullet points).',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || '';
  const bullets = raw
    .split(/\n+/)
    .map((line) => line.replace(/^[\s\-*•·]+\s*/, '').trim())
    .filter((line) => line.length > 0);

  return { summary: bullets };
}

module.exports = { extractArticleText, summarizeWithOpenAI };
