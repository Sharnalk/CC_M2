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
 * Fusionne les deux fichiers officiels INSEE (communes + départements) en un
 * seul fichier simple : Code_Commune_INSEE,Nom_Commune,Code_Departement,Nom_Departement
 *
 * C'est un programme Java classique (pas de Hadoop ici) : on l'exécute une
 * seule fois, à la préparation des données, avant de lancer le Job MapReduce.
 *
 * Usage : PrepareCommunes <communes-2026.csv> <departements-2026.csv> <communes.csv (sortie)>
 *
 * Formats réels attendus en entrée (séparateur virgule, champs entre guillemets) :
 * - communes    : TYPECOM,COM,REG,DEP,CTCD,ARR,TNCC,NCC,NCCENR,LIBELLE,CAN,COMPARENT
 * - departements: DEP,REG,CHEFLIEU,TNCC,NCC,NCCENR,LIBELLE
 */
public class PrepareCommunes {

    private static final char DELIMITER = ',';

    public static void main(String[] args) throws IOException {
        String communesPath = args.length > 0 ? args[0] : "data/communes-2026.csv";
        String departementsPath = args.length > 1 ? args[1] : "data/departements-2026.csv";
        String outputPath = args.length > 2 ? args[2] : "data/communes.csv";

        Map<String, String> nomDepartementParCode = chargerDepartements(departementsPath);
        System.out.println("Départements chargés : " + nomDepartementParCode.size());

        int lignesEcrites = 0;
        int communesSansDepartement = 0;

        try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(communesPath), StandardCharsets.UTF_8));
             BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(outputPath), StandardCharsets.UTF_8))) {

            writer.write("Code_Commune_INSEE,Nom_Commune,Code_Departement,Nom_Departement");
            writer.newLine();

            String line = reader.readLine(); // en-tête, ignorée
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = CsvUtils.splitCsvLine(line, DELIMITER);
                if (cols.length < 10) {
                    continue; // ligne malformée
                }

                String codeCommune = cols[1];   // COM
                String codeDepartement = cols[3]; // DEP
                String nomCommune = cols[9];    // LIBELLE

                String nomDepartement = nomDepartementParCode.get(codeDepartement);
                if (nomDepartement == null) {
                    communesSansDepartement++;
                    continue; // pas de département connu (ex: collectivités d'outre-mer), on ignore
                }

                writer.write(codeCommune + "," + nomCommune + "," + codeDepartement + "," + nomDepartement);
                writer.newLine();
                lignesEcrites++;
            }
        }

        System.out.println("Communes écrites  : " + lignesEcrites);
        System.out.println("Communes ignorées (département inconnu) : " + communesSansDepartement);
        System.out.println("Fichier généré : " + outputPath);
    }

    private static Map<String, String> chargerDepartements(String path) throws IOException {
        Map<String, String> result = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(path), StandardCharsets.UTF_8))) {
            String line = reader.readLine(); // en-tête, ignorée
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) {
                    continue;
                }
                String[] cols = CsvUtils.splitCsvLine(line, DELIMITER);
                if (cols.length < 7) {
                    continue;
                }
                String codeDepartement = cols[0]; // DEP
                String nomDepartement = cols[6];  // LIBELLE
                result.put(codeDepartement, nomDepartement);
            }
        }
        return result;
    }
}
