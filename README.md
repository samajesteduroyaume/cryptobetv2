# CryptoBet v2 - Plateforme de Paris Sportifs Web3

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

Plateforme de paris sportifs avec paiements crypto et interface professionnelle type Unibet.

## ⚠️ Architecture Hybride (Centralisée + Web3)

**IMPORTANT**: Cette application est **hybride**, pas entièrement décentralisée.

### Composants CENTRALISÉS
- ✅ **Frontend**: Hébergé sur Vercel (serveur centralisé)
- ✅ **Backend**: API Routes Next.js sur Vercel
- ✅ **Base de données**: Vercel KV (Redis) - stockage centralisé
- ✅ **Données sportives**: API-Sports.io (service externe centralisé)
- ✅ **Logique métier**: Gérée côté serveur

### Composants DÉCENTRALISÉS (Web3)
- ✅ **Paiements**: Transactions blockchain (Ethereum/Optimism/Arbitrum)
- ✅ **Wallet**: Contrôle utilisateur (MetaMask, WalletConnect)
- ✅ **Smart Contract**: Logique de paris on-chain (optionnel)

### Pourquoi cette architecture ?

**Avantages:**
- 💰 **Coût réduit**: Évite les gas fees élevés pour chaque action
- ⚡ **Performance**: Réponse instantanée vs 15-30s on-chain
- 🎯 **UX fluide**: Pas d'attente de confirmation blockchain pour chaque clic
- 📊 **Données en temps réel**: Impossible d'avoir les cotes sportives on-chain

**Inconvénients:**
- ❌ **Point de défaillance**: Dépendance au serveur Vercel
- ❌ **Confiance requise**: Les utilisateurs doivent faire confiance au serveur pour les cotes
- ❌ **Censure possible**: Le serveur peut être bloqué

**Pour une vraie décentralisation**, il faudrait:
- Héberger sur IPFS + ENS
- Utiliser des oracles Chainlink (~$50-100/requête)
- Tout stocker on-chain (très coûteux en gas)

## 🏗️ Stack Technique

**Frontend**
- Next.js 14 (App Router) - Framework React
- TypeScript - Typage statique
- Tailwind CSS - Styling
- Wagmi + ConnectKit - Intégration Web3

**Backend (Centralisé)**
- Next.js API Routes - Serverless functions
- Vercel KV (Redis) - Base de données
- API-Sports.io - Données sportives

**Blockchain (Décentralisé)**
- Ethereum, Optimism, Arbitrum
- Smart Contracts Solidity (optionnel)
- WalletConnect v2

## 📁 Structure du Projet

```
cryptobetv2/
├── apps/web/                   # Application Next.js
│   ├── app/
│   │   ├── api/               # API Routes (CENTRALISÉ)
│   │   │   ├── matches/       # Récupération matchs
│   │   │   └── bets/          # Gestion paris
│   │   ├── page.tsx           # Page d'accueil
│   │   └── globals.css        # Thème Deep Blue
│   ├── lib/
│   │   ├── db.ts              # Vercel KV (CENTRALISÉ)
│   │   └── services/
│   │       └── sportsApi.ts   # Client API-Sports.io
│   ├── src/
│   │   ├── components/        # Composants UI
│   │   └── config/
│   │       └── Web3Provider.tsx # Config Web3
│   └── tailwind.config.js
├── packages/contracts/         # Smart Contracts (DÉCENTRALISÉ)
│   └── contracts/Bets.sol
└── docs/                       # Documentation
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- Compte Vercel (gratuit)
- Clé API-Sports.io (gratuit: 100 req/jour)

### Setup Local

```bash
# Cloner le repo
git clone https://github.com/samajesteduroyaume/cryptobetv2.git
cd cryptobetv2

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cd apps/web
cp .env.example .env.local
```

### Configuration `.env.local`

```bash
# API Sports (CENTRALISÉ)
API_SPORTS_KEY=votre_cle_api_ici

# Web3 (DÉCENTRALISÉ)
NEXT_PUBLIC_MASTER_WALLET_ADDRESS=0xVotreAdresse
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=votre_project_id

# Vercel KV (CENTRALISÉ - Auto en production)
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...
```

> **⚠️ SÉCURITÉ**: Ne commitez JAMAIS vos clés API dans le dépôt Git. Utilisez toujours `.env.local` pour le développement local.

### Lancement

```bash
npm run dev
# → http://localhost:3000
```

## 📡 API Documentation

### Endpoints (Tous CENTRALISÉS)

#### `GET /api/matches`

Récupère les matchs avec cotes.

**Réponse:**
```json
{
  "matches": [
    {
      "id": "match-123",
      "name": "Premier League",
      "sport_type": "football",
      "team1_name": "Manchester United",
      "team2_name": "Liverpool",
      "start_time": "2024-01-15T20:00:00Z",
      "odds_team1": 2.10,
      "odds_draw": 3.40,
      "odds_team2": 3.20
    }
  ]
}
```

**Source de données:** API-Sports.io (centralisé)  
**Cache:** Vercel KV, TTL 5 minutes  
**Fallback:** Matchs par défaut si API down

#### `POST /api/bets`

Crée un pari (enregistrement centralisé).

**Body:**
```json
{
  "matchId": "match-123",
  "betType": "team1",
  "amount": 0.1,
  "walletAddress": "0x..."
}
```

**Réponse:**
```json
{
  "betId": "bet-456",
  "qrCode": "data:image/png;base64,...",
  "paymentAddress": "0x..."
}
```

**Stockage:** Vercel KV (centralisé)  
**Paiement:** Blockchain (décentralisé)

## 🎨 Interface Unibet-Style

### Design Professionnel

- **Vue Liste Compacte**: Tableau dense des matchs
- **Groupement par Ligue**: Organisation claire
- **Filtres par Sport**: Football, Basketball, Tennis, F1
- **Boutons de Cotes 1-N-2**: Interface familière
- **Thème Deep Blue**: Couleurs professionnelles

### Responsive

- Mobile first
- Sidebar cachée sur mobile
- Tableau adaptatif

## 🔐 Flux de Pari

### 1. Affichage des Matchs (CENTRALISÉ)

```
User → Frontend → API /matches → Vercel KV → API-Sports.io
                                    ↓
                              Cache 5 min
                                    ↓
                            Retour au Frontend
```

### 2. Placement du Pari (HYBRIDE)

```
User clique sur cote
    ↓
Frontend → API /bets (CENTRALISÉ)
    ↓
Vercel KV: Enregistrement pari (status: pending)
    ↓
Retour QR code au Frontend
    ↓
User scanne QR → Wallet (DÉCENTRALISÉ)
    ↓
Transaction Blockchain (DÉCENTRALISÉ)
    ↓
Confirmation → Update Vercel KV (CENTRALISÉ)
```

**Points centralisés:**
- Enregistrement du pari
- Génération du QR code
- Vérification du statut

**Points décentralisés:**
- Paiement effectif
- Contrôle du wallet
- Transaction on-chain

## 🚢 Déploiement Vercel

### Étapes

1. **Push sur GitHub**
```bash
git add .
git commit -m "feat: initial deployment"
git push origin master
```

2. **Connecter à Vercel**
- Aller sur vercel.com
- Import repository
- Root Directory: `apps/web`

3. **Variables d'environnement**
```
API_SPORTS_KEY=votre_cle_api_ici
NEXT_PUBLIC_MASTER_WALLET_ADDRESS=0x...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
```

4. **Créer Vercel KV**
- Storage → Create Database → KV
- Variables auto-injectées

5. **Deploy**

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour plus de détails.

## ⚙️ Configuration

### Vercel KV (Base de Données CENTRALISÉE)

**Production:**
- Vercel KV (Redis persistant)
- Plan Pro requis ($20/mois)

**Development:**
- Fallback en mémoire (gratuit)
- Données perdues au redémarrage

**Alternative gratuite:**
- Utiliser Supabase ou PlanetScale
- Modifier `lib/db.ts`

### API-Sports.io (CENTRALISÉ)

**Quotas:**
- Gratuit: 100 requêtes/jour
- Basic: 3000 req/jour ($10/mois)

**Gestion:**
- Cache 5 minutes dans Vercel KV
- Fallback automatique si quota dépassé

## 🔒 Sécurité

### Centralisé (Serveur)

- ✅ HTTPS obligatoire
- ✅ Variables d'environnement sécurisées
- ✅ Rate limiting sur API Routes
- ⚠️ **Point de confiance**: Le serveur contrôle les cotes

### Décentralisé (Blockchain)

- ✅ Wallet contrôlé par l'utilisateur
- ✅ Transactions vérifiables on-chain
- ✅ Smart contract auditable
- ⚠️ **Gas fees** à la charge de l'utilisateur

## 📊 Limitations

### Actuelles

1. **Centralisation du serveur**
   - Vercel peut bloquer/censurer
   - Downtime possible
   - Confiance requise pour les cotes

2. **Base de données centralisée**
   - Vercel KV peut perdre des données
   - Pas d'audit trail on-chain
   - Historique modifiable par le serveur

3. **API externe**
   - Dépendance à API-Sports.io
   - Quota limité
   - Pas de vérification on-chain

### Solutions pour plus de décentralisation

**Court terme:**
- Ajouter signature cryptographique des cotes
- Publier hash des cotes on-chain

**Moyen terme:**
- Migrer vers IPFS pour le frontend
- Utiliser The Graph pour l'indexation

**Long terme:**
- Oracles Chainlink pour les résultats
- Stockage 100% on-chain
- DAO pour la gouvernance

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'feat: Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Documentation Complète

- [Architecture Technique](docs/ARCHITECTURE.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)

## 📞 Support

- GitHub Issues: [cryptobetv2/issues](https://github.com/samajesteduroyaume/cryptobetv2/issues)

## ⚖️ License

MIT License

---

**Disclaimer**: Cette application est hybride (centralisée + Web3). Le serveur contrôle les cotes et l'enregistrement des paris. Seuls les paiements sont décentralisés via blockchain.
