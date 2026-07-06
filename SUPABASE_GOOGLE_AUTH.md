# Guide de Configuration : Authentification Google avec Supabase

Ce guide explique comment obtenir les identifiants **Client ID** et **Client Secret** depuis Google Cloud pour les intégrer à votre projet Supabase.

---

## 📋 Étape 1 : Récupérer l'URL de redirection de Supabase

1. Allez sur votre dashboard **[Supabase](https://supabase.com)**.
2. Naviguez dans votre projet `dpabljaxtgokrgilomws`.
3. Allez dans **Authentication** > **Providers** > **Google**.
4. Repérez le champ **Callback URL (redirect)**. Il ressemble à ceci :
   `https://dpabljaxtgokrgilomws.supabase.co/auth/v1/callback`
5. **Copiez cette URL** (nous en aurons besoin à l'étape 2).

---

## 🛠️ Étape 2 : Créer les identifiants sur Google Cloud Console

1. Connectez-vous sur la **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Créez un **Nouveau Projet** en cliquant sur le sélecteur de projet en haut à gauche (ex: *FocusFlow*).
3. Configurez l'écran de consentement :
   - Recherchez **"Écran de consentement OAuth"** dans la barre de recherche.
   - Sélectionnez le type d'utilisateur **"Externe"** (External) puis cliquez sur **Créer**.
   - Remplissez les champs requis (*Nom de l'application*, *Adresse e-mail d'assistance*, *Coordonnées du développeur*).
   - Enregistrez et passez les étapes jusqu'à revenir au tableau de bord.
4. Générez les clés API :
   - Allez dans l'onglet **Identifiants** (Credentials) dans le menu de gauche.
   - Cliquez sur **+ Créer des identifiants** > **Code client OAuth** (OAuth client ID).
   - Choisissez **Application Web** comme type d'application.
   - (Optionnel) Dans **Origines JavaScript autorisées**, ajoutez : `http://localhost:3000`.
   - Dans **URI de redirection autorisés**, cliquez sur **Ajouter un URI** et collez l'URL copiée à l'étape 1 (`https://dpabljaxtgokrgilomws.supabase.co/auth/v1/callback`).
   - Cliquez sur **Créer**.

---

## 🔑 Étape 3 : Activer le provider sur Supabase

1. Une fois le code client créé sur Google, une fenêtre affichera votre **ID client** (Client ID) et le **Code secret du client** (Client Secret).
2. Retournez sur votre dashboard **Supabase** (Authentication > Providers > Google).
3. Activez l'interrupteur **"Enable Google provider"**.
4. Collez l'**ID client** et le **Code secret du client** dans les champs correspondants.
5. Cliquez sur **Save**.

---

## 🌐 Variables d'environnement en local (`.env`)

Assurez-vous que votre fichier `.env` à la racine du projet contient bien les clés suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=https://dpabljaxtgokrgilomws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
*(Remarque : `NEXT_PUBLIC_APP_URL` est requis par nos Server Actions pour rediriger l'utilisateur vers son localhost après la connexion).*
