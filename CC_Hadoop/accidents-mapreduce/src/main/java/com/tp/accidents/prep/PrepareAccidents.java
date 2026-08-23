package com.tp.accidents.prep;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Fusionne les deux fichiers officiels BAAC (caractéristiques + usagers) en un
 * seul fichier simple : Num_Acc,code_insee,gravite
 *
 * Le fichier "caractéristiques" donne la commune de l'accident, mais pas sa
 * gravité : la gravité est enregistrée par personne impliquée, dans le
 * fichier "usagers" (plusieurs lignes possibles par accident). La gravité
 * retenue pour l'accident est la PIRE blessure parmi toutes les personnes
 * impliquées (c'est la convention officielle ONISR).
 *
 * Programme Java classique (pas de Hadoop) : à exécuter une seule fois avant
 * de lancer le Job MapReduce.
 *
 * Usage : PrepareAccidents <caract-2024.csv> <usagers-2024.csv> <accidents.csv (sortie)>
 *
 * Formats réels attendus en entrée (séparateur point-virgule, champs entre guillemets) :
 * - caract  : Num_Acc;jour;mois;an;hrmn;lum;dep;com;agg;int;atm;col;adr;lat;long
 * - usagers : Num_Acc;id_usager;id_vehicule;num_veh;place;catu;grav;sexe;an_nais;...
 *
 * Codes officiels de gravité (colonne grav) : 1=Indemne, 2=Tué, 3=Blessé hospitalisé, 4=Blessé léger.
 */

/// Resume
/// Merge the two official BAAC files (caract-2xxx + usagers-2xxx) into a single simple file: Num_Acc,code_insee,gravite
/// caract give the commune of the accident, but not its severity: the severity is recorded per person involved, in the "usagers" file (multiple lines possible per accident). The severity retained for the accident is the WORST injury among all people involved (this is the official ONISR convention).
/// Return 
/// Java program (not Hadoop): to be run once before running the MapReduce Job.
public class PrepareAccidents {

    private static final char DELIMITER = ';';
    
    private static final Map<String, Integer> RANG_PAR_CODE_GRAV = new HashMap<>();
    static {
        RANG_PAR_CODE_GRAV.put("2", 0); // Tué
        RANG_PAR_CODE_GRAV.put("3", 1); // Blessé hospitalisé
        RANG_PAR_CODE_GRAV.put("4", 2); // Blessé léger
        RANG_PAR_CODE_GRAV.put("1", 3); // Indemne
    }
    private static final String[] LIBELLE_PAR_RANG = {"Tue", "BlesseHospitalise", "BlesseLeger", "Indemne"};

    public static void main(String[] args) throws IOException {
        String caractPath = args.length > 0 ? args[0] : "data/caract-2024.csv";
        String usagersPath = args.length > 1 ? args[1] : "data/usagers-2024.csv";
        String outputPath = args.length > 2 ? args[2] : "data/accidents.csv";

        Map<String, Integer> pireRangParAccident = calculerPireGraviteParAccident(usagersPath);
        System.out.println("Accidents avec au moins un usager : " + pireRangParAccident.size());

        int lignesEcrites = 0;
        int accidentsSansUsager = 0;

        try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(caractPath), StandardCharsets.UTF_8));
             BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(outputPath), StandardCharsets.UTF_8))) {

            writer.write("Num_Acc,code_insee,gravite");
            writer.newLine();

            String line = reader.readLine(); // en-tête, ignorée
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = CsvUtils.splitCsvLine(line, DELIMITER);
                if (cols.length < 8) {
                    continue; // ligne malformée
                }

                String numAcc = cols[0];
                String codeInsee = cols[7]; // com (déjà le code INSEE complet, ex: "70285")

                Integer rang = pireRangParAccident.get(numAcc);
                String gravite;
                if (rang == null) {
                    accidentsSansUsager++;
                    gravite = "Indemne"; // par défaut, prudence : pas d'usager recensé
                } else {
                    gravite = LIBELLE_PAR_RANG[rang];
                }

                writer.write(numAcc + "," + codeInsee + "," + gravite);
                writer.newLine();
                lignesEcrites++;
            }
        }

        System.out.println("Accidents écrits : " + lignesEcrites);
        System.out.println("Accidents sans usager trouvé (gravité par défaut = Indemne) : " + accidentsSansUsager);
        System.out.println("Fichier généré : " + outputPath);
    }

    private static Map<String, Integer> calculerPireGraviteParAccident(String usagersPath) throws IOException {
        Map<String, Integer> pireRang = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(usagersPath), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // en-tête, ignorée
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = CsvUtils.splitCsvLine(line, DELIMITER);
                if (cols.length < 7) {
                    continue; // ligne malformée
                }
                String numAcc = cols[0];
                String codeGrav = cols[6];
                Integer rang = RANG_PAR_CODE_GRAV.get(codeGrav);
                if (rang == null) {
                    continue; // code de gravité inattendu, on ignore cette ligne
                }
                pireRang.merge(numAcc, rang, Math::min); // on garde le rang le plus petit = la pire blessure
            }
        }
        return pireRang;
    }
}
