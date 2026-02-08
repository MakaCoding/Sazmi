# Sažetak vijesti

Jednostavna web aplikacija za brzo sažimanje vijesti s portala (Index, Slobodna Dalmacija i sl.) u obliku kratkih natuknica na hrvatskom. Koristi Node.js, Express i OpenAI API.

## Zahtjevi

- Node.js 18+ (preporučeno LTS)

## Instalacija i pokretanje

1. **Instaliraj ovisnosti**

   ```bash
   npm install
   ```

2. **Postavi API ključ (kad ga imaš)**

   - Kopiraj primjer konfiguracije:  
     `copy .env.example .env` (Windows) ili `cp .env.example .env` (Mac/Linux)
   - U datoteci `.env` postavi svoj OpenAI ključ:  
     `OPENAI_API_KEY=tvoj_pravi_kljuc`
   - Bez ključa aplikacija će raditi, ali će umjesto sažetka prikazati uputu za postavljanje ključa.

3. **Pokreni server**

   ```bash
   npm start
   ```

4. **Otvori u pregledniku**

   - Na računalu: [http://localhost:3000](http://localhost:3000)
   - Na mobitelu (isti WiFi): `http://[IP_tvog_računala]:3000` (npr. `http://192.168.1.5:3000`)

## Korištenje

1. Zalijepi URL članka (npr. s index.hr ili slobodnadalmacija.hr) u polje.
2. Klikni **Sažmi**.
3. Sažetak se prikaže ispod u obliku natuknica na hrvatskom.

## Deployment na Vercel

Aplikacija koristi **relativne putanje** (`/api/summarize`), pa radi i na Vercelu bez promjene koda.

1. Repozitorij poveži s Vercelom (Import Project).
2. **Environment Variables** u Vercel projektu: dodaj `OPENAI_API_KEY` s vrijednošću svog OpenAI ključa.
3. Deploy – Vercel automatski prepoznaje `api/` folder kao serverless funkcije i `vercel.json` za rewrite glavne stranice.

Lokalno i dalje pokrećeš `npm start` (Express); na Vercelu se koriste samo rute iz `api/`.

## Struktura projekta

```
PrvaProbnaAplikacija/
├── api/
│   └── summarize.js   # Vercel serverless: POST /api/summarize
├── lib/
│   └── summarize.js   # Zajednička logika (dohvat članka + OpenAI)
├── server.js         # Express za lokalno pokretanje
├── vercel.json       # Rewrite / → public/index.html
├── package.json
├── public/
│   └── index.html    # Sučelje (poziva relativno /api/summarize)
└── README.md
```

## Napomene

- **OpenAI API**: Za stvarne sažetke potreban je OpenAI API ključ. Model po defaultu je `gpt-4o-mini` (jeftiniji). Možeš ga promijeniti u `.env` s `OPENAI_MODEL=gpt-4o` ili drugim modelom.
- Neki portali mogu blokirati dohvat sadržaja; u tom slučaju ćeš dobiti poruku da stranica nije dohvaćena.
- Dizajn je prilagođen prvenstveno mobitelu (mobile-first), tamna tema.
