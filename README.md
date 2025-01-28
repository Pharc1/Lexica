# HR-GPT

<p align="center">
  <img src="app/static/images/lexica.png" alt="Lexica Logo" />
</p>

## Description

**Lexica** est un assistant virtuel conçu pour automatiser l'accès aux politiques et documents internes d'une entreprise. Grâce à l'intelligence artificielle et à l'intégration des modèles Hugging Face, il permet aux employés de poser des questions en langage naturel et d'obtenir des réponses précises à partir de documents internes (politiques de congés, remboursements, etc.).

## Fonctionnalités

- **Base de Connaissances** : Accès aux politiques internes stockées dans l'app.
- **Assistant Conversationnel** : Réponses aux questions courantes grâce à un modèle de langage fine-tuné de Hugging Face.
- **Système de Recommandation** : Suggestions personnalisées basées sur les rôles et les besoins des employés.
- **Notifications** : Alertes sur les mises à jour des politiques et rappels de conformité.

## Technologies Utilisées

- **Langage de Programmation** : Python
- **Framework** : Flask
- **Modèles** : OpenAI GPT-4 Mini, modèles Hugging Face
- **Infrastructure Cloud** : Google Cloud pour le déploiement et la gestion des services
- **Stockage** : Interne au container Flask pour l'instant

## Installation

### Étapes d'installation

1. Clonez le repository :

   ```bash
   git clone https://github.com/Pharc1/lexica.git
   cd lexica
   ```

## Utilisation

Lancez l'application Flask :

```bash
docker-compose up --build
```

Accédez à l'interface utilisateur via [http://localhost:8080](http://localhost:8080).

## Exemple de Données dans la Base de Connaissances


### Guide d'Accueil - TechNova Industries 

Bienvenue à TechNova Industries!

Nous sommes ravis de vous compter parmi nous. Voici un guide pour vous orienter dans vos premiers jours chez TechNova.

1. **Votre arrivée le premier jour :**
   - Veuillez vous présenter à l'accueil à 9h00 pour obtenir votre badge.
   - Un membre de l'équipe RH vous conduira ensuite à votre bureau.

2. **Configuration IT :**
   - Vous recevrez un email de bienvenue avec vos identifiants pour tous les systèmes nécessaires.
   - Pour des questions IT, contactez l'équipe à support@technova.com.

3. **Formation d’intégration :**
   - Une session d'orientation est prévue le 3ème jour de votre arrivée.
   - Vous y apprendrez la culture de notre entreprise, les politiques internes et les outils utilisés.

4. **Café et Repas :**
   - La cantine est située au 2ème étage, ouverte de 12h00 à 14h00.
   - Le café est disponible gratuitement à la machine située dans le hall principal.

## License

Ce projet est sous la licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

Pour toute question, n'hésitez pas à me contacter à l'adresse [kpharci@gmail.com](mailto:kpharci@gmail.com).

![HR-GPT Screenshot](app/static/images/screenshot.png)
