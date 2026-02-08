require('dotenv').config();
const express = require('express');
const path = require('path');
const { extractArticleText, summarizeWithOpenAI } = require('./lib/summarize');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

    const result = await summarizeWithOpenAI(articleText);
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
