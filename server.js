require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Model za sažimanje (iz .env ili gpt-4o-mini – brz i jeftin)
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Dohvaća tekst članka s URL-a (parsira HTML).
 * Podržani selektori za Index, Slobodna Dalmacija i slične portale.
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

  // Ukloni skripte, style, navigaciju
  $('script, style, nav, header, footer, .ad, .ads, iframe').remove();

  // Česti selektori za sadržaj članka na vijesti portalima
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
 * Koristi OPENAI_API_KEY iz .env datoteke i model gpt-4o-mini.
 */
async function summarizeWithOpenAI(articleText, url) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'tvoj-api-kljuc-ovdje') {
    return {
      summary: [
        'API ključ nije postavljen.',
        'U datoteci .env dodaj: OPENAI_API_KEY=tvoj_pravi_openai_kljuc',
        'Zatim ponovno pokreni server.',
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

app.post('/api/summarize', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL je obavezan.' });
    }

    let articleText;
    try {
      articleText = await extractArticleText(url);
    } catch (err) {
      console.error('Fetch error:', err.message);
      return res.status(422).json({
        error: 'Nije moguće dohvatiti stranicu. Provjeri URL i pokušaj ponovno.',
      });
    }

    if (articleText.length < 50) {
      return res.status(422).json({
        error: 'S stranice nije izvučen dovoljno dug tekst. Možda portal blokira dohvat.',
      });
    }

    const result = await summarizeWithOpenAI(articleText, url);
    res.json(result);
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({
      error: err.message || 'Došlo je do greške pri sažimanju.',
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});
