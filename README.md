# auth-gateway-service

Le **service d’authentification et de gateway** est un microservice central jouant un **double rôle stratégique** au sein de la plateforme de gestion des réclamations :

1. **Service d’authentification et d’autorisation**
2. **API Gateway** pour l’ensemble des microservices métiers

Il constitue le **point d’entrée unique** du système et assure à la fois la sécurité, le routage et le filtrage des requêtes.

Ce service repose sur **Spring Boot**, **Spring Security** et **Spring Cloud Gateway**.

---

## Dépendances

- **JHipster Registry(registersgr.jar)**
- Base de données relationnelle

## Rôles et responsabilités

### 1. Authentification et autorisation

Le service assure :

- La gestion des comptes utilisateurs
- L’authentification des utilisateurs
- La génération et la validation des **JWT**
- La gestion des rôles et des profils (ADMIN, ETUDIANT, SCOLARITE, PROFESSEUR, DIRECTEUR, etc.)
- Le contrôle d’accès aux ressources protégées

### 2. API Gateway

En tant que Gateway, le service assure :

- Le **routage des requêtes HTTP** vers les microservices métiers
- La **centralisation de la sécurité**
- La validation des tokens JWT avant transmission
- La réduction de l’exposition directe des microservices
- La gestion des chemins d’API (`/api/**`)

---

## Architecture

- **Type** : Microservice transversal (Auth + Gateway)
- **Framework Gateway** : Spring Cloud Gateway
- **Communication** : REST
- **Sécurité** : Spring Security + JWT
- **Découverte de services** : JHipster Registry (Eureka)
- **Configuration centralisée** : JHipster Registry

---

## Position dans l’architecture globale
Client (Angular)
|
v
Auth / Gateway Service
|
v
Microservices métiers

Aucun accès direct aux microservices métiers n’est autorisé depuis le client.

---

## Prérequis

- Java 21 
- Maven
- Node.js et npm 
- Docker et Docker Compose (optionnel)
- JHipster Registry en cours d’exécution

---

## Lancement en mode développement

Assurez-vous que la **JHipster Registry** est accessible :
- Lancer JHipster Registry depuis le cmd avec la commande: java -jar registersgr
- Tester avec l'url:
http://localhost:8761


Puis démarrez le service : 
./mvnw


---

## Sécurité et filtrage Gateway

- Toutes les requêtes passent par la Gateway
- Les routes protégées nécessitent un JWT valide
- Le token est extrait et validé avant routage
- Les rôles sont vérifiés via Spring Security

En-tête requis :
Authorization: Bearer <token>


---

## Routes exposées (exemples)

### Authentification

- `POST /api/authenticate`
- `POST /api/register`
- `GET /api/account`

### Routage Gateway (exemples)

- `/services/reclamations/**` → `reclamation-service`
- `/api/reclamations/**` → `reclamation-service`

---

## Tests
./mvnw verify

---

## Construction pour la production
./mvnw -Pprod clean verify


Lancement :
java -jar target/*.jar

---

## Remarque importante

Ce service est **obligatoire au démarrage** de la plateforme.  
Sans lui :
- aucun microservice n’est accessible,
- aucune requête client n’est acceptée.



