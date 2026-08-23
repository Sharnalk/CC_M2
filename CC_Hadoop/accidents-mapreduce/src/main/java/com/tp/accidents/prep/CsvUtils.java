package com.tp.accidents.prep;

/**
 * Découpage minimal d'une ligne CSV : sépare sur le délimiteur donné puis
 * retire les guillemets de chaque champ. Suffisant ici car aucune des
 * colonnes qu'on lit (Num_Acc, com, dep, grav, COM, DEP, LIBELLE...) ne
 * contient elle-même le délimiteur à l'intérieur des guillemets.
 */
final class CsvUtils {

    private CsvUtils() {
    }

    static String[] splitCsvLine(String line, char delimiter) {
        String[] rawCols = line.split(java.util.regex.Pattern.quote(String.valueOf(delimiter)), -1);
        String[] cols = new String[rawCols.length];
        for (int i = 0; i < rawCols.length; i++) {
            cols[i] = stripQuotes(rawCols[i]);
        }
        return cols;
    }

    private static String stripQuotes(String s) {
        String trimmed = s.trim();
        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.trim();
    }
}
