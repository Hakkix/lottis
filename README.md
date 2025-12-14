# 🎅 Tonttujahti - Lotan Joulupeli

Hauskaa joulua Lotan kanssa! Nappaa kaikki piileksivät tontut swaippaamalla oikeaan suuntaan.

🎮 **Pelaa nyt: [lottapeli.vercel.app](https://lottapeli.vercel.app)**

## 🎮 Pelin Idea

Lotta (musta labradori) istuu ruudun keskellä. Tontut piileksivät neljässä eri paikassa:
- 🎄 Kuusi (ylhäällä)
- 🎁 Lahjat (alhaalla)
- 🔥 Takka (vasemmalla)
- 🥣 Ruokakuppi (oikealla)

Kun tonttu ilmestyy, swaippaa nopeasti tontun suuntaan! Peli nopeutuu pisteiden myötä.

## 🚀 Pika-aloitus

```bash
# Asenna riippuvuudet
npm install

# Käynnistä kehityspalvelin
npm run dev

# Avaa selain osoitteessa http://localhost:3000
```

### 🔧 Redis-konfiguraatio (Leaderboard)

Peli käyttää Vercel KV:tä (Redis) leaderboard-tallennukseen.

**Vercel-tuotannossa:**

1. Mene Vercel dashboardiin: https://vercel.com/dashboard/stores
2. Luo uusi KV database (tai käytä olemassaolevaa)
3. Liitä database projektiin:
   - Klikkaa KV databasea
   - Mene "Connect to Project" -välilehdelle
   - Valitse projektisi ja klikkaa "Connect"
4. Ympäristömuuttujat asetetaan automaattisesti Vercelissä

**Lokaalissa kehityksessä:**

1. Kopioi `.env.local.example` → `.env.local`
2. Hae ympäristömuuttujat Vercelin dashboardista:
   - Mene projektisi asetuksiin: Settings > Environment Variables
   - Tai KV databasen `.env`-välilehdeltä
3. Täytä arvot `.env.local`-tiedostoon:
   ```bash
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
   ```

**Debuggaus:**

Jos leaderboard ei toimi, tarkista Vercelin logeista (`vercel logs`):
- `[Leaderboard POST]` näyttää tallennuksen onnistumisen
- `hasKvUrl` ja `hasKvToken` kertovat onko ympäristömuuttujat asetettu

## 🏗️ Build & Deploy

```bash
# Tee tuotantoversio
npm run build

# Käynnistä tuotantopalvelin
npm start
```

### Vercel-deploy:

```bash
# Asenna Vercel CLI
npm i -g vercel

# Deployaa
vercel
```

## 📱 PWA-tuki

Peli toimii Progressive Web App:ina, joten sen voi "asentaa" puhelimen kotivalikkoon:

1. Avaa peli selaimessa
2. Valitse "Lisää kotivalikkoon" / "Add to Home Screen"
3. Pelaa ilman osoitepalkkia!

## 🎨 Grafiikka

Projekti sisältää SVG-placeholder-kuvat Lotasta. Voit korvata ne oikeilla valokuvilla:

- `public/lotta-idle.webp` - Lotta istuu paikoillaan
- `public/lotta-up.webp` - Lotta hyppää ylös
- `public/lotta-down.webp` - Lotta venyttelee (play bow)
- `public/lotta-left.webp` - Lotta juoksee vasemmalle
- `public/lotta-right.webp` - Lotta juoksee oikealle
- `public/lotta-happy.webp` - Lotta onnellinen (tonttu suussa)
- `public/lotta-confused.webp` - Lotta hämmentynyt

Kuvat voivat olla SVG, PNG, JPG tai WebP -formaatissa.

## 🎯 Ominaisuudet

- ✅ Swipe-ohjaus (toimii hiirellä ja kosketuksella)
- ✅ Ennätysten tallennus (localStorage)
- ✅ Globaali leaderboard (Vercel KV / Redis)
- ✅ Vaikeutuminen pisteiden myötä
- ✅ Visuaalinen palaute (confetti, animaatiot)
- ✅ Mobiiilioptimoidut
- ✅ PWA-tuki

## 🛠️ Teknologiat

- **Next.js 15** - React-framework
- **TypeScript** - Tyypitys
- **Tailwind CSS** - Tyylit
- **Framer Motion** - Animaatiot
- **react-swipeable** - Swipe-ohjaus
- **canvas-confetti** - Konfetti-efekti
- **Vercel KV** - Redis-pohjainen leaderboard-tallennus

## 📄 Lisenssi

Lotan oma joulupeli! 🐶🎄
