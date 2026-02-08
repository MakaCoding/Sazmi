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

## Struktura projekta

```
PrvaProbnaAplikacija/
├── server.js          # Express server i API za sažimanje
├── package.json       # Ovisnosti i skripte
├── .env.example       # Primjer .env (kopiraj u .env)
├── .env               # Tvoj API ključ (ne dijeliti!)
├── public/
│   └── index.html     # Jednostrani sučelje (mobile-first, tamna tema)
└── README.md
```

## Napomene

- **OpenAI API**: Za stvarne sažetke potreban je OpenAI API ključ. Model po defaultu je `gpt-4o-mini` (jeftiniji). Možeš ga promijeniti u `.env` s `OPENAI_MODEL=gpt-4o` ili drugim modelom.
- Neki portali mogu blokirati dohvat sadržaja; u tom slučaju ćeš dobiti poruku da stranica nije dohvaćena.
- Dizajn je prilagođen prvenstveno mobitelu (mobile-first), tamna tema.
