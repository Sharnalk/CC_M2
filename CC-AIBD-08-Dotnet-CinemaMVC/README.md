# CC-AIBD-08 — Application de gestion de cinémas (ASP.NET Core MVC)

Application web MVC de gestion d'un groupe de cinémas : une **partie publique**
(consulter les cinémas, chercher un film, voir la programmation d'une salle jour
par jour) et une **partie administration protégée par authentification** (CRUD
complet sur Cinémas, Salles, Films, Séances).

Stack : **ASP.NET Core MVC (.NET 10)**, **Entity Framework Core 9**,
**PostgreSQL**, **ASP.NET Core Identity**, **xUnit + Moq** pour les tests,
**Tailwind CSS + Preline UI** (via CDN) pour les vues.

> C'est bien du **MVC**, et non du Blazor : `Program.cs` appelle
> `AddControllersWithViews()` puis `MapControllerRoute(...)`, et le projet contient
> 39 vues `.cshtml` et **aucun** fichier `.razor`.

👉 **[SECURITE-ET-TESTS.md](SECURITE-ET-TESTS.md)** — détail des mesures de sécurité
réellement en place (hachage, CSRF, XSS, cookies…) et de ce que vérifie chacun des
8 tests, avec les limites assumées.

### Le système de classes des vues

Les vues n'écrivent pas directement des chaînes d'utilitaires Tailwind. Un bloc
`<style type="text/tailwindcss">` dans `_Layout.cshtml` définit, via `@apply`, un
vocabulaire de composants — `.btn-primary`, `.card`, `.input`, `.table`, `.badge`,
`.page-title`… Les vues décrivent alors une **intention** (`class="btn-primary"`)
plutôt qu'une mise en forme, et un changement de style se fait à un seul endroit.

Trois familles de partiels suppriment la duplication qui restait :
`_Pagination.cshtml` (le bloc était recopié à l'identique dans les 4 listes),
`_SearchBar.cshtml`, et un `_Form.cshtml` par entité, partagé par `Create` et `Edit`.

Résultat mesuré : **2 060 → 1 328 lignes de vues, soit 732 lignes en moins (−35 %)**,
à fonctionnalités identiques.

Code **vérifié de bout en bout** : compilation sans warning, 8 tests au vert,
application lancée et servie sur `http://localhost:5063` avec base PostgreSQL
réelle et seeding automatique (voir « Vérifications effectuées » en bas).

## Structure

```
CinemaMVC.sln
CinemaMVC.Web/
  Program.cs                  # composition root : EF Core, Identity, DI, middleware, seeding
  Models/Entities/            # Cinema, Room, Movie, Session — le modèle métier
  Models/ViewModels/          # RegisterViewModel, LoginViewModel, ResetPassword... (formulaires)
  Data/
    ApplicationDbContext.cs   # DbContext + configuration des relations et du DeleteBehavior
    DbInitializer.cs          # seeding : admin, 3 cinémas, salles, films, séances J et J+1
  Repositories/
    IRepository.cs            # contrat générique (documenté : c'est l'abstraction du projet)
    Repository.cs             # implémentation EF Core générique
  Services/
    ICinemaService.cs / CinemaService.cs   # 1 service par agrégat, logique de pagination + recherche
    IMovieService.cs / MovieService.cs
    IRoomService.cs / RoomService.cs
    ISessionService.cs / SessionService.cs
  Controllers/                # Home (public), Account (Identity), Cinema/Movie/Room/Session (admin)
  Middlewares/
    GlobalExceptionHandlingMiddleware.cs  # capture toute exception non gérée -> /Home/Error
  Views/                      # Razor + Tailwind
CinemaMVC.Tests/
  CinemaServiceTests.cs             # tests unitaires du service (EF Core InMemory)
  MovieSessionServiceTests.cs
  HomeControllerIntegrationTests.cs # test d'intégration via WebApplicationFactory
CinemaMVC_Postman_Collection.json
```

## Architecture — pourquoi ces trois couches

Le flux est `Controller → Service → Repository<T> → EF Core → PostgreSQL`.

- **`Repository<T>` générique** évite de réécrire `GetByIdAsync` / `GetAllAsync` /
  `AddAsync` pour chacune des 4 entités. Il expose aussi `GetQueryable()`, ce qui
  permet aux services de composer des requêtes LINQ **exécutées côté base** (la
  pagination ne ramène pas toute la table en mémoire).
- **Un service par agrégat** porte ce que le repository générique ne sait pas
  faire : filtrage, pagination, chargement des relations (`Include`). C'est là
  qu'est la logique métier, pas dans les contrôleurs.
- **Les contrôleurs restent minces** : valider `ModelState`, appeler un service,
  choisir une vue. C'est ce qui rend les services testables sans HTTP.

Les interfaces (`IRepository<T>`, `I*Service`) portent la documentation XML : elles
constituent le contrat. Les implémentations utilisent `<inheritdoc />` plutôt que
de dupliquer cette documentation.

## Démarrage

### 1. Base de données (PostgreSQL via Docker)

Le `docker-compose.yml` est à la **racine du dossier CC_M2** (il est partagé avec
les autres projets). Le conteneur `cc-postgres` expose PostgreSQL sur le port
**5433** (et non 5432, pour ne pas entrer en conflit avec une installation locale).

```bash
cd /home/sharnalk/Projects/CC_M2
docker compose up -d postgres
```

Chaîne de connexion correspondante (`CinemaMVC.Web/appsettings.json`) :
`Host=localhost;Database=cinema_db;Username=cinema_user;Password=cinema_password;Port=5433`

### 2. Lancer l'application

```bash
cd CC-AIBD-08-Dotnet-CinemaMVC/CinemaMVC.Web
dotnet run --launch-profile http
```

L'application écoute sur **http://localhost:5063**. Au démarrage, `DbInitializer`
crée le schéma s'il n'existe pas puis insère les données de démonstration — il ne
réinsère rien si la base contient déjà des cinémas, donc il est sans risque de
relancer.

**Compte administrateur seedé** : `admin@cinegroup.com` / `Admin123!`

### Pas d'inscription publique — créer un administrateur en base

Il n'y a **aucun formulaire d'inscription** sur ce site : c'est un choix assumé, pas
un oubli. Un site public de cinéma n'a pas de raison de laisser n'importe qui créer
un compte administrateur. Le seul compte fourni est celui du seeding ci-dessus ; pour
en créer un autre, il faut l'insérer directement en base.

Le point technique : ASP.NET Core Identity ne stocke jamais un mot de passe en clair,
seulement son hash **PBKDF2-HMAC-SHA256** salé — impossible à écrire à la main en SQL.
Il faut donc générer ce hash une fois, avec le même algorithme que l'application, puis
l'insérer par une requête `INSERT` classique.

**1. Générer le hash** (nécessite le SDK .NET, pas l'application elle-même) :

```bash
mkdir -p /tmp/hashgen && cd /tmp/hashgen
dotnet new console
dotnet add package Microsoft.Extensions.Identity.Core --version 9.0.2
```

Remplacer le contenu de `Program.cs` par :

```csharp
using Microsoft.AspNetCore.Identity;

// PasswordHasher<TUser> est générique et ne lit aucune propriété de TUser :
// n'importe quel type suffit, la classe concrète IdentityUser n'est pas nécessaire.
var hasher = new PasswordHasher<object>();
Console.WriteLine(hasher.HashPassword(null!, args[0]));
```

```bash
dotnet run -- "MonMotDePasse123!"
```

Copier la chaîne affichée (elle commence par `AQAAAAI...`).

**2. Insérer l'utilisateur en base** :

```bash
docker exec -it cc-postgres psql -U cinema_user -d cinema_db
```

```sql
INSERT INTO "AspNetUsers"
  ("Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail",
   "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp",
   "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnabled", "AccessFailedCount")
VALUES
  (gen_random_uuid()::text, 'nouvel-admin@cinegroup.com', 'NOUVEL-ADMIN@CINEGROUP.COM',
   'nouvel-admin@cinegroup.com', 'NOUVEL-ADMIN@CINEGROUP.COM',
   true, 'COLLER_LE_HASH_ICI',
   gen_random_uuid()::text, gen_random_uuid()::text,
   false, false, false, 0);
```

Points d'attention : `NormalizedUserName`/`NormalizedEmail` doivent être **en
MAJUSCULES** (Identity compare sur cette colonne, pas sur `Email`) ; `EmailConfirmed`
doit être `true`, sinon la connexion est refusée ; `gen_random_uuid()` remplace le
`Guid.NewGuid()` que ferait normalement le code C#.

**Vérification faite pour ce guide** : cette procédure a été testée de bout en bout —
hash généré par ce script exact, inséré dans la base réelle du projet, connexion
réussie via le formulaire `/Account/Login` (redirection 302 + cookie d'authentification
émis), puis compte supprimé après vérification.

### 3. Lancer les tests

```bash
cd CC-AIBD-08-Dotnet-CinemaMVC
dotnet test
```

Les tests n'ont **pas** besoin de PostgreSQL : ils utilisent le provider EF Core
InMemory, avec un nom de base généré par `Guid.NewGuid()` à chaque test pour
garantir leur isolation.

## Points d'expertise à aborder à l'oral

**1. Pourquoi un repository générique ET des services.** La question classique est
« le repository ne fait-il pas doublon avec `DbContext` ? ». Réponse : `DbSet<T>`
est déjà un repository, l'intérêt ici n'est pas d'abstraire EF Core mais de fournir
un point d'injection unique pour les tests et d'empêcher les contrôleurs de
manipuler directement le contexte. La preuve est dans `CinemaServiceTests` : on
instancie `new Repository<Cinema>(context)` avec un contexte InMemory, sans toucher
au reste de l'application.

**2. Pagination exécutée côté base.** `GetCinemasPagedAsync` part de
`GetQueryable()`, applique le filtre puis `Skip`/`Take`, et ne matérialise qu'à
`ToListAsync()`. La requête SQL générée contient donc `LIMIT`/`OFFSET` : sur une
table volumineuse, on ne transfère que la page demandée. C'est vérifiable en direct
grâce aux logs EF Core affichés dans la console au niveau `Information`.

**3. Gestion des suppressions en cascade.** `ApplicationDbContext.OnModelCreating`
fixe explicitement les `DeleteBehavior` via la Fluent API plutôt que de laisser la
convention EF Core décider. Les trois relations sont en `Cascade` :
Cinéma → Salles, Salle → Séances, Film → Séances. Concrètement, supprimer un cinéma
emporte ses salles **et**, de proche en proche, les séances de ces salles ; supprimer
un film supprime toutes ses séances.

C'est un choix cohérent pour ce domaine (une séance n'a aucun sens sans son film ni
sa salle), mais c'est **le point à assumer explicitement à l'oral** : si l'on voulait
conserver un historique de billetterie, il faudrait passer Film → Séances en
`DeleteBehavior.Restrict` et refuser la suppression d'un film encore programmé. Le
fait que ce soit écrit explicitement plutôt que laissé à la convention est justement
ce qui rend ce choix visible et modifiable en un seul endroit.

**4. Sécurité des formulaires.** Toutes les actions POST portent
`[ValidateAntiForgeryToken]` (protection CSRF) et les contrôleurs d'administration
portent `[Authorize]` au niveau de la classe — donc une action ajoutée plus tard est
protégée par défaut, ce qui est plus sûr que d'annoter action par action.

**5. Le parcours « mot de passe oublié ».** Il est complet côté Identity (génération
d'un token, validation, réinitialisation) mais **aucun serveur SMTP n'est configuré** :
le lien de réinitialisation est passé en `TempData` et affiché sur la page de
confirmation. C'est un choix assumé, commenté dans `AccountController`, qui rend le
parcours démontrable de bout en bout sans dépendre d'un service d'e-mail.

**6. Middleware d'exception global.** `GlobalExceptionHandlingMiddleware` est
enregistré en premier dans le pipeline afin d'englober tout ce qui suit. Il logue
l'exception puis redirige vers `/Home/Error` : l'utilisateur ne voit jamais une
stack trace, et l'erreur reste tracée côté serveur.

## Vérifications effectuées

- `dotnet build` : **succès, 0 warning, 0 erreur**.
- `dotnet test` : **8 tests, 8 réussis**.
- **Application réellement parcourue dans un navigateur**, sur la base PostgreSQL du
  conteneur `cc-postgres` :
  - accueil : les 5 cinémas seedés s'affichent ;
  - recherche « Inception » : 3 séances trouvées dans 2 cinémas ;
  - programmation d'un cinéma : 5 films groupés avec horaires, salles et tarifs,
    onglets **Aujourd'hui / Demain** fonctionnels ;
  - `/Cinema` sans être connecté → **redirection vers la page de connexion** ;
  - connexion `admin@cinegroup.com` / `Admin123!` → accès à la gestion des cinémas,
    avec recherche et pagination ;
  - `/Account/Register` → **404** (l'inscription publique a été retirée) ;
  - création d'un compte administrateur **directement en base PostgreSQL** (hash
    PBKDF2 généré hors application, `INSERT` SQL manuel) → connexion réussie via
    `/Account/Login` (302 + cookie d'authentification émis), procédure documentée
    dans le README ci-dessus.

### Correction importante appliquée

Les séances de démonstration étaient créées **relativement au jour du premier
démarrage**, à l'intérieur du bloc de seeding qui ne s'exécute qu'une fois. La base
ayant été initialisée en juillet, la page « programmation du jour » — l'écran vitrine
du projet — affichait **« Aucune programmation ce jour »**.

`DbInitializer` recale désormais les séances sur la date du jour à chaque démarrage
(`RealignSessionsToTodayAsync`) : le décalage entre la première séance et aujourd'hui
est appliqué à toutes les séances, ce qui préserve leur répartition relative (jour J
et J+1) et leurs horaires. L'opération est sans effet si les séances sont déjà à
jour, donc sans risque à relancer.
