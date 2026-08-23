package com.tp.accidents;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

/**
 * Pour chaque ligne d'accident : cherche le département correspondant (jointure
 * en mémoire via le fichier communes.csv chargé une seule fois dans setup()),
 * et émet (Nom_Departement, stats) où stats porte à la fois :
 *  - la FRÉQUENCE : +1 systématiquement (chaque accident valide compte)
 *  - la GRAVITÉ   : +1 dans la catégorie exacte de l'accident (tué, blessé
 *                   hospitalisé, blessé léger, ou indemne)
 *
 * Aucun accident n'est ignoré : chaque ligne alimente à la fois le total et
 * sa catégorie de gravité. Les 4 libellés ci-dessous doivent rester alignés
 * avec ceux écrits par PrepareAccidents.java (LIBELLE_PAR_RANG).
 *
 * Format attendu de accidents.csv : Num_Acc,code_insee,gravite
 * Format attendu de communes.csv  : Code_Commune_INSEE,Nom_Commune,Code_Departement,Nom_Departement
 */
public class AccidentsMapper extends Mapper<LongWritable, Text, Text, AccidentStatsWritable> {

    private static final String GRAVITE_TUE = "Tue";
    private static final String GRAVITE_BLESSE_HOSPITALISE = "BlesseHospitalise";
    private static final String GRAVITE_BLESSE_LEGER = "BlesseLeger";
    private static final String GRAVITE_INDEMNE = "Indemne";
    private static final String DEPARTEMENT_INCONNU = "DEPARTEMENT_INCONNU";

    private final Map<String, String> departementParCommune = new HashMap<>();

    @Override
    protected void setup(Context context) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(new File("communes.csv")), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // en-tête, ignorée
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = line.split(",", -1);
                if (cols.length < 4) {
                    continue; // ligne malformée, on l'ignore simplement
                }
                String codeInsee = cols[0].trim();
                String nomDepartement = cols[3].trim();
                departementParCommune.put(codeInsee, nomDepartement);
            }
        }
    }

    @Override
    protected void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
        String line = value.toString();
        if (line.trim().isEmpty() || line.startsWith("Num_Acc")) {
            return; // ligne vide ou en-tête du CSV
        }

        String[] cols = line.split(",", -1);
        if (cols.length < 3) {
            return; // ligne malformée
        }

        String codeInsee = cols[1].trim();
        String gravite = cols[2].trim();

        String departement = departementParCommune.get(codeInsee);
        Text departementKey = new Text(departement != null ? departement : DEPARTEMENT_INCONNU);

        long tue = GRAVITE_TUE.equals(gravite) ? 1 : 0;
        long blesseHospitalise = GRAVITE_BLESSE_HOSPITALISE.equals(gravite) ? 1 : 0;
        long blesseLeger = GRAVITE_BLESSE_LEGER.equals(gravite) ? 1 : 0;
        long indemne = GRAVITE_INDEMNE.equals(gravite) ? 1 : 0;

        context.write(departementKey, new AccidentStatsWritable(1, tue, blesseHospitalise, blesseLeger, indemne));
    }
}
