# Frontend Agent Instructions

## Stack

- Le frontend utilise Next.js.
- Avant de modifier du code lié à Next.js, lire la documentation locale dans `node_modules/next/dist/docs/`.
- Utiliser TypeScript quand c’est possible.
- Respecter la structure existante du projet.

## Style de code

- Suivre les patterns déjà présents dans le dossier `frontend/`.
- Ne pas ajouter de nouvelle dépendance sans justification claire.
- Préférer les composants réutilisables plutôt que dupliquer du JSX.
- Garder les changements simples et ciblés.
- Ne pas refactorer des fichiers non liés à la demande.

## UI / UX

- Respecter le design existant.
- Construire des interfaces responsive desktop et mobile.
- Prévoir les états importants : chargement, erreur, vide, succès.
- Éviter les textes qui débordent ou les éléments qui se chevauchent.
- Utiliser les composants et styles existants avant d’en créer de nouveaux.

## Accessibilité

- Utiliser du HTML sémantique.
- Ajouter des labels aux champs de formulaire.
- Garder un contraste lisible.
- Les boutons et liens doivent être accessibles au clavier.

## Tests et vérification

- Après une modification importante, lancer les tests ou le lint si disponibles.
- Vérifier que l’application démarre correctement.
- Si une commande échoue, expliquer l’erreur au lieu de masquer le problème.

## Contraintes

- Ne pas modifier le backend sauf demande explicite.
- Ne pas toucher aux fichiers de configuration sensibles sans validation.
- Ne pas supprimer du code existant sauf si c’est clairement nécessaire.
