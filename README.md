# 🎅 Tonttujahti - Lotan Joulupeli

Hauskaa joulua Lotan kanssa! Nappaa kaikki piileksivät tontut swaippaamalla oikeaan suuntaan.

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

- `public/lotta-idle.svg` - Lotta istuu paikoillaan
- `public/lotta-up.svg` - Lotta hyppää ylös
- `public/lotta-down.svg` - Lotta venyttelee (play bow)
- `public/lotta-left.svg` - Lotta juoksee vasemmalle
- `public/lotta-right.svg` - Lotta juoksee oikealle
- `public/lotta-happy.svg` - Lotta onnellinen (tonttu suussa)
- `public/lotta-confused.svg` - Lotta hämmentynyt

Kuvat voivat olla SVG, PNG, JPG tai WebP -formaatissa.

## 🎯 Ominaisuudet

- ✅ Swipe-ohjaus (toimii hiirellä ja kosketuksella)
- ✅ Ennätysten tallennus (localStorage)
- ✅ Vaikeutuminen pisteiden myötä
- ✅ Visuaalinen palaute (confetti, animaatiot)
- ✅ Mobiiilioptimoidut
- ✅ PWA-tuki

## 🛠️ Teknologiat

- **Next.js 15** - React-framework
- **TypeScript** - Tyypitys
- **Tailwind CSS** - Tyylit
- **Framer Motion** - Animaatiot
- **react-swipeable** - Swipe-gstuurit
- **canvas-confetti** - Konfetti-efekti

## 📄 Lisenssi

Lotan oma joulupeli! 🐶🎄
