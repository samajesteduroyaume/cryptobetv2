# Guide de Déploiement Vercel

## Prérequis

- Compte Vercel (gratuit)
- Repository GitHub connecté
- Clés API configurées

## Étapes de Déploiement

### 1. Préparation du Code

Assurez-vous que tous les fichiers sont commités:

```bash
git status
git add .
git commit -m "chore: prepare for vercel deployment"
git push origin master
```

### 2. Import du Projet sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New..." > "Project"
3. Importer le repository `cryptobetv2`
4. Sélectionner le framework: **Next.js**
5. Root Directory: `apps/web`

### 3. Configuration des Variables d'Environnement

Dans Vercel Dashboard > Settings > Environment Variables, ajouter:

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `API_SPORTS_KEY` | `4894b9b4b5b1efe95cc221bf9696dd98` | Production, Preview, Development |
| `NEXT_PUBLIC_MASTER_WALLET_ADDRESS` | Votre adresse Ethereum | Production, Preview, Development |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | Votre Project ID WalletConnect | Production, Preview, Development |

### 4. Configuration Vercel KV (Base de Données)

1. Dans le dashboard Vercel, aller dans **Storage**
2. Cliquer sur **Create Database**
3. Sélectionner **KV** (Redis)
4. Nommer la base: `cryptobet-kv`
5. Région: Choisir la plus proche de vos utilisateurs
6. Cliquer sur **Create**

Les variables suivantes seront automatiquement ajoutées:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

### 5. Configuration Build

**Framework Preset**: Next.js  
**Build Command**: `npm run build` (auto-détecté)  
**Output Directory**: `.next` (auto-détecté)  
**Install Command**: `npm install` (auto-détecté)

**Root Directory**: `apps/web`

### 6. Déploiement

Cliquer sur **Deploy**

Le déploiement prend environ 2-3 minutes.

### 7. Vérification Post-Déploiement

Une fois déployé, vérifier:

✅ L'application charge correctement  
✅ Les matchs s'affichent (API Sports fonctionne)  
✅ La connexion wallet fonctionne  
✅ Les onglets de filtrage fonctionnent  
✅ Pas d'erreurs dans les logs Vercel

### 8. Configuration du Domaine (Optionnel)

1. Aller dans **Settings** > **Domains**
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions Vercel

## Déploiements Automatiques

Chaque push sur `master` déclenchera un déploiement automatique.

Pour les branches feature:
- Chaque push crée un **Preview Deployment**
- URL unique pour tester avant merge

## Rollback

En cas de problème:

1. Aller dans **Deployments**
2. Trouver le dernier déploiement fonctionnel
3. Cliquer sur les 3 points > **Promote to Production**

## Monitoring

### Logs

Vercel Dashboard > Deployments > [Sélectionner déploiement] > Logs

### Analytics

Vercel Dashboard > Analytics (disponible sur plan Pro)

### Alertes

Configurer des alertes pour:
- Erreurs 500
- Temps de réponse élevé
- Quota API dépassé

## Optimisations Production

### Performance

- **Image Optimization**: Activé par défaut avec Next.js Image
- **Edge Functions**: Considérer pour les API Routes critiques
- **Caching**: Headers de cache configurés dans `next.config.mjs`

### Sécurité

- **HTTPS**: Activé automatiquement
- **Headers de sécurité**: Configurer dans `next.config.mjs`
- **Rate Limiting**: Implémenter pour les API Routes

### Coûts

**Plan Hobby (Gratuit):**
- 100GB bandwidth/mois
- Serverless Functions: 100h/mois
- Vercel KV: Non inclus (nécessite plan Pro)

**Plan Pro ($20/mois):**
- 1TB bandwidth
- Serverless Functions: 1000h
- Vercel KV: Inclus (500MB)

**Alternative pour Hobby:**
- Utiliser le fallback en mémoire (données non persistantes)
- Ou utiliser une base de données externe (Supabase, PlanetScale)

## Troubleshooting

### Erreur: "Module not found"

```bash
# Vérifier les dépendances
npm install
# Rebuild
vercel --prod --force
```

### Erreur: "API Sports 403"

- Vérifier que `API_SPORTS_KEY` est correctement configurée
- Vérifier le quota sur api-sports.io
- Le fallback s'active automatiquement

### Erreur: "KV not available"

- Vérifier que Vercel KV est créé et lié au projet
- Le système bascule automatiquement sur stockage en mémoire

### Build Timeout

Si le build dépasse 45 minutes (limite Hobby):
- Optimiser les dépendances
- Utiliser `output: 'standalone'` dans `next.config.mjs`

## Commandes CLI Utiles

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Voir les logs
vercel logs

# Lister les déploiements
vercel ls

# Lier le projet local
vercel link
```

## Checklist Pré-Déploiement

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Vercel KV est créé et lié (ou fallback activé)
- [ ] Les tests passent localement
- [ ] Pas d'erreurs de build
- [ ] `.gitignore` exclut `node_modules`, `.env.local`, `.next`
- [ ] `vercel.json` est configuré si nécessaire
- [ ] Documentation à jour

## Support

En cas de problème:
- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [GitHub Issues](https://github.com/samajesteduroyaume/cryptobetv2/issues)
