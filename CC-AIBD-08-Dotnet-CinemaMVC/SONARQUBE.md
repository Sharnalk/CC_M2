# Analyse SonarQube — CC-AIBD-08 (.NET)

SonarQube tourne déjà (conteneur `cc-sonarqube`, partagé avec les autres
projets M2, défini dans `docker-compose.yml` à la racine de `CC_M2_PRES`).

```bash
docker ps | grep cc-sonarqube   # doit afficher "Up"
```

## 1. Créer le projet et le jeton (une seule fois)

1. Ouvrir http://localhost:9000, se connecter (`admin` / `admin` au premier
   lancement, un changement de mot de passe est imposé).
2. **Projects → Create Project → Manually**.
   - Project key : `cc-aibd-08-cinemamvc`
   - Display name : `CC-AIBD-08 CinemaMVC`
3. **Mon compte → Sécurité → Generate Tokens** — nommer le jeton, le
   copier immédiatement (il n'est affiché qu'une fois).

## 2. Installer l'outil (déjà fait sur cette machine)

```bash
dotnet tool install --global dotnet-sonarscanner
export PATH="$PATH:$HOME/.dotnet/tools"   # à ajouter dans ~/.bashrc si absent
```

## 3. Lancer l'analyse

Toujours depuis la racine du projet (`CC-AIBD-08-Dotnet-CinemaMVC/`, là où
est le `.sln`) — l'analyse encadre un `dotnet build` complet :

```bash
cd CC-AIBD-08-Dotnet-CinemaMVC

dotnet sonarscanner begin \
  /k:"cc-aibd-08-cinemamvc" \
  /d:sonar.host.url="http://localhost:9000" \
  /d:sonar.token="LE_JETON_COPIE_A_L'ETAPE_1"

dotnet build

dotnet sonarscanner end \
  /d:sonar.token="LE_JETON_COPIE_A_L'ETAPE_1"
```

Le rapport apparaît sur http://localhost:9000/dashboard?id=cc-aibd-08-cinemamvc
quelques secondes après la fin de `sonarscanner end`.

## Pour inclure la couverture de tests (optionnel, mais valorisant à l'oral)

```bash
dotnet sonarscanner begin \
  /k:"cc-aibd-08-cinemamvc" \
  /d:sonar.host.url="http://localhost:9000" \
  /d:sonar.token="LE_JETON" \
  /d:sonar.cs.opencover.reportsPaths="**/coverage.opencover.xml"

dotnet build

cd CinemaMVC.Tests
dotnet test --collect:"XPlat Code Coverage" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=opencover
cd ..

dotnet sonarscanner end /d:sonar.token="LE_JETON"
```
