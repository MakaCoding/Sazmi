/**
 * Vercel Serverless Function: POST /api/summarize
 * Koristi relativni put – frontend poziva samo /api/summarize (bez localhost).
 */
const { extractArticleText, summarizeWithOpenAI } = require('../lib/summarize');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Dozvoljena je samo metoda POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { url } = body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL je obavezan.' });
      return;
    }

    let articleText;
    try {
      articleText = await extractArticleText(url);
    } catch (err) {
      console.error('Fetch error:', err.message);
      res.status(422).json({
        error: 'Nije moguće dohvatiti stranicu. Provjeri URL i pokušaj ponovno.',
      });
      return;
    }

    if (articleText.length < 50) {
      res.status(422).json({
        error: 'S stranice nije izvučen dovoljno dug tekst. Možda portal blokira dohvat.',
      });
      return;
    }

    const result = await summarizeWithOpenAI(articleText);
    res.status(200).json(result);
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({
      error: err.message || 'Došlo je do greške pri sažimanju.',
    });
  }
};
