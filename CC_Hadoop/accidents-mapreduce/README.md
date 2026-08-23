# Fréquence et Gravité des Accidents par Département — Map-Side Join

Job MapReduce unique : jointure `accidents.csv` (gros fichier) ↔ `communes.csv` (petit
fichier, chargé en mémoire via le Distributed Cache), qui calcule pour chaque
département à la fois la **fréquence** (nombre total d'accidents) et la **gravité**
en détail (nombre de tués, blessés hospitalisés, blessés légers, indemnes) —
conformément à l'énoncé ("calculer la fréquence et la gravité des accidents par Nom
de Département").

Code **testé et vérifié de bout en bout** (compilation + exécution réelle du Job) sur
les **vraies données BAAC 2024** (54 402 accidents) — voir "Résultat vérifié" plus bas.

## Structure

```
pom.xml
src/main/java/com/tp/accidents/
  AccidentsDriver.java         # configure le Job, ajoute communes.csv au Distributed Cache
  AccidentsMapper.java         # setup() charge la HashMap, map() fait la jointure, émet (departement, stats)
  AccidentsReducer.java        # somme les 5 compteurs par département (aussi utilisé comme Combiner)
  AccidentStatsWritable.java   # porte total + les 4 catégories de gravité à travers Hadoop
src/main/java/com/tp/accidents/prep/
  PrepareCommunes.java         # fusionne communes-2026.csv + departements-2026.csv -> data/communes.csv
  PrepareAccidents.java        # fusionne caract-2024.csv + usagers-2024.csv -> data/accidents.csv
  CsvUtils.java                # petit utilitaire de découpage CSV partagé
data/
  caract-2024.csv, usagers-2024.csv       # fichiers BAAC officiels bruts (séparateur ;)
  communes-2026.csv, departements-2026.csv # fichiers INSEE officiels bruts (séparateur ,)
  communes.csv, accidents.csv              # générés par les scripts de prépa (voir ci-dessous)
```

## Pourquoi deux scripts de préparation (et pas dans le Mapper)

Les fichiers officiels ne sont pas directement dans le format simple attendu par le
Mapper, et ce n'est **pas** le même travail que celui du Mapper :

- Le Mapper fait UNE chose : la jointure `accident → commune → département` via le
  Cache Distribué (le Map-Side Join, la technique demandée par le sujet).
- Les scripts de prépa recollent des fichiers sources qui n'auraient jamais dû être
  séparés dans l'énoncé simplifié : `caract-2024.csv` (BAAC "caractéristiques") donne
  la commune de l'accident (`com`) mais **pas la gravité** — la gravité est enregistrée
  par personne impliquée, dans `usagers-2024.csv` (colonne `grav`, plusieurs lignes
  possibles par accident). `PrepareAccidents` fusionne les deux sur `Num_Acc` et
  retient, pour chaque accident, la **pire blessure** parmi toutes les personnes
  impliquées (convention ONISR) :
  `grav=2 (Tué) > grav=3 (Blessé hospitalisé) > grav=4 (Blessé léger) > grav=1 (Indemne)`.
- `communes-2026.csv` (INSEE) donne le code département (`DEP`) mais pas son nom ;
  `departements-2026.csv` donne `DEP -> Nom`. `PrepareCommunes` fusionne les deux.

Faire cette fusion caract+usagers *en Hadoop* nécessiterait un 2ème Job (agrégation
usagers -> pire gravité, puis jointure) — ce qui contredirait l'énoncé ("un seul Job
MapReduce") et ramènerait à la complexité du Sujet 1. La fusion en Java classique,
exécutée une fois avant le Job, est la bonne place pour ce nettoyage.

## Format des fichiers générés (ceux que lit le Mapper)

- `data/accidents.csv` : `Num_Acc,code_insee,gravite` (gravite ∈ {Tue, BlesseHospitalise, BlesseLeger, Indemne})
- `data/communes.csv` : `Code_Commune_INSEE,Nom_Commune,Code_Departement,Nom_Departement`

## Comment lancer le code — étape par étape

### 1. Build

```bash
cd accidents-mapreduce
mvn package
```

Produit `target/accidents-mapreduce.jar` (autonome) et `target/classes` (les .class,
utilisés pour lancer les scripts de prépa sans avoir besoin du jar).

### 2. Préparation des données (une seule fois, avant le Job)

```bash
java -cp target/classes com.tp.accidents.prep.PrepareCommunes \
    data/communes-2026.csv data/departements-2026.csv data/communes.csv

java -cp target/classes com.tp.accidents.prep.PrepareAccidents \
    data/caract-2024.csv data/usagers-2024.csv data/accidents.csv
```

Sortie attendue (chiffres obtenus sur les données réelles) :
```
Départements chargés : 101
Communes écrites  : 34920
Communes ignorées (département inconnu) : 2576   <- collectivités d'outre-mer, hors périmètre départemental
Accidents avec au moins un usager : 54402
Accidents écrits : 54402
```

### 3. Lancer le Job MapReduce (en local, sans Hadoop ni Docker)

Les 3 chemins (accidents, communes, output) sont fixés directement dans
`AccidentsDriver.java` (constantes `ACCIDENTS_PATH`, `COMMUNES_PATH`,
`OUTPUT_PATH`) — plus besoin de les passer en argument. Lancer depuis la racine
du projet (là où se trouve le dossier `data/`) :

```bash
rm -rf output_local   # le dossier de sortie ne doit pas déjà exister
java -cp target/accidents-mapreduce.jar com.tp.accidents.AccidentsDriver
cat output_local/part-r-00000
```

### 4. Lancer sur le vrai cluster (Docker)

Le cluster (4 conteneurs : `namenode`, `datanode`, `hadoop-runner`, `nodemanager`)
est décrit dans `docker-compose.yml`, à la racine de ce projet. `./data` et
`./target` sont montés directement dans le conteneur `hadoop-runner` — pas besoin
de `docker cp`, le jar généré par `mvn package` est immédiatement visible dedans.

**Démarrage (une fois)** :
```bash
docker-compose up -d
docker exec -it hadoop-runner jps   # doit lister ResourceManager (et NameNode/DataNode
                                     # sur leurs conteneurs respectifs) : le cluster est prêt
```

Sur le cluster, les chemins ne sont plus `data/accidents.csv` mais des chemins
HDFS. Il faut donc changer les 3 constantes dans `AccidentsDriver.java` avant de
rebuild le jar pour ce mode :

```java
private static final String ACCIDENTS_PATH = "/user/hadoop/input/accidents.csv";
private static final String COMMUNES_PATH = "/lookup/communes.csv";
private static final String OUTPUT_PATH = "/user/hadoop/output";
```

**Envoi des données sur HDFS (une fois, sauf si les données changent)** :
```bash
mvn package
docker exec -it hadoop-runner bash -c "hdfs dfs -mkdir -p /user/hadoop/input /lookup"
docker exec -it hadoop-runner bash -c "hdfs dfs -put /data/accidents.csv /user/hadoop/input/accidents.csv"
docker exec -it hadoop-runner bash -c "hdfs dfs -put /data/communes.csv /lookup/communes.csv"
```

**Boucle de test (à chaque modification du code)** :
```bash
mvn package   # target/accidents-mapreduce.jar est déjà visible dans le conteneur (bind mount)
docker exec -it hadoop-runner bash -c "hdfs dfs -rm -r -f /user/hadoop/output"
docker exec -it hadoop-runner bash -c "hadoop jar /programs/accidents-mapreduce.jar com.tp.accidents.AccidentsDriver"
docker exec -it hadoop-runner bash -c "hdfs dfs -cat /user/hadoop/output/part-r-00000"
```

Interfaces web pour suivre les Jobs sans ligne de commande : HDFS sur
`http://localhost:9870`, YARN (avancement des Jobs) sur `http://localhost:8088`.

**Pour tout arrêter** : `docker-compose down` (garde les données HDFS grâce aux
volumes nommés). Pour repartir de zéro : `docker-compose down -v`.

## Résultat vérifié sur les vraies données BAAC 2024

102 lignes en sortie (101 départements + `DEPARTEMENT_INCONNU`). Vérifications faites :
la somme des `total` = 54402 (= nombre d'accidents généré par `PrepareAccidents`,
aucun accident perdu), et pour chaque département, `tues + blessesHospitalises +
blessesLegers + indemnes == total` (aucune double-comptabilisation).

```
Paris                total=4191, tues=31,  blessesHospitalises=373,  blessesLegers=3787, indemnes=0
Bouches-du-Rhône     total=2120, tues=108, blessesHospitalises=607,  blessesLegers=1405, indemnes=0
DEPARTEMENT_INCONNU  total=555,  tues=73,  blessesHospitalises=277,  blessesLegers=205,  indemnes=0
```

Totaux France entière : 54402 accidents, dont 3226 mortels, 16432 avec blessé(s)
hospitalisé(s), 34744 avec blessé(s) léger(s) seulement, **0 accident classé
"indemne"**. Ce dernier point n'est pas un bug : BAAC ne recense que les accidents
*corporels* (avec au moins un blessé) — un accident où personne n'est blessé n'entre
jamais dans ce fichier, donc la catégorie "indemne" au niveau accident (pire blessure
= aucune) ne peut logiquement jamais apparaître ici.

(Paris a la plus forte fréquence d'accidents mais une mortalité relativement faible —
trafic dense mais vitesses réduites ; les Bouches-du-Rhône ont la plus forte mortalité
malgré une fréquence plus faible que Paris. `DEPARTEMENT_INCONNU` correspond aux
accidents des collectivités d'outre-mer, dont les communes n'ont pas de code
département dans le référentiel utilisé.)

## Points d'expertise à aborder à l'oral (voir l'énoncé, section 3.4)

**1. Implémentation du `setup()` du Mapper.** `AccidentsMapper.setup()` ouvre
`new File("communes.csv")` — ce nom n'est pas le chemin réel du fichier (qui peut être
sur HDFS ou en local), c'est l'**alias** fixé dans le Driver via
`job.addCacheFile(new URI(communesPath + "#communes.csv"))`. Hadoop copie le fichier
dans le répertoire de travail local de chaque tâche *avant* que `setup()` ne s'exécute,
et l'expose sous ce nom d'alias — c'est ça, "la gestion du chemin d'accès au fichier
distribué" : on ne manipule jamais le chemin réel, seulement l'alias.

**2. Efficacité et Performance.** Sans Map-Side Join, il faudrait un Reduce-Side Join :
chaque ligne des DEUX fichiers (54402 accidents + 34920 communes, soit ~89K lignes)
transiterait par le réseau pendant le Shuffle, taguée par `code_insee`, pour que le
Reducer fasse la jointure. Avec le Map-Side Join, `communes.csv` est copié une fois par
machine (pas par ligne), et **seules les paires `(departement, stats)` déjà agrégées**
transitent par le Shuffle — 102 clés distinctes, pas 89K lignes. Le gain vient du fait
qu'on évite de faire voyager la grosse table sur le réseau juste pour la jointure.

**3. Gestion des Fichiers (URI).** `job.addCacheFile` accepte une URI — sur le vrai
cluster ce sera `hdfs://.../communes.csv`, en local un simple chemin fichier. Dans les
deux cas, Hadoop télécharge/copie ce fichier vers le répertoire de travail local de
chaque nœud de calcul avant l'exécution des tâches ; le `#alias` dans l'URI ne change
pas la source, seulement le nom sous lequel il apparaît localement — c'est ce qui
permet à `setup()` de toujours écrire `new File("communes.csv")`, peu importe l'URI
d'origine.

**4. Complexité du Jeu de Données.** Concrètement rencontré dans ce projet : séparateurs
différents selon le fichier (`;` pour les CSV BAAC, `,` pour les CSV INSEE), champs entre
guillemets (`CsvUtils.splitCsvLine`), gravité éclatée dans un fichier séparé nécessitant
une agrégation (`PrepareAccidents`), et 2576 communes sans département connu
(collectivités d'outre-mer) gérées via le bucket `DEPARTEMENT_INCONNU` plutôt que de
faire planter le Job.
