package com.tp.accidents;

import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

/**
 * Driver du Job "Sévérité des Accidents par Département" (Map-Side Join).
 *
 * Les 3 chemins sont fixés directement ici (pas d'arguments en ligne de
 * commande) : plus simple à lancer, il suffit de changer les constantes
 * ci-dessous si besoin.
 * - ACCIDENTS_PATH : gros fichier, en entrée normale du Job (HDFS ou local)
 * - COMMUNES_PATH  : petit fichier de correspondance commune -> département,
 *                     distribué à tous les Mappers via le Distributed Cache
 * - OUTPUT_PATH    : dossier de sortie (ne doit pas exister avant le run)
 */
public class AccidentsDriver {

    private static final String ACCIDENTS_PATH = "/user/hadoop/input/accidents.csv";
    private static final String COMMUNES_PATH = "/lookup/communes.csv";
    private static final String OUTPUT_PATH = "/user/hadoop/output";

    public static void main(String[] args) throws Exception {
        String accidentsPath = ACCIDENTS_PATH;
        String communesPath = COMMUNES_PATH;
        String outputPath = OUTPUT_PATH;

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Frequence et gravite des accidents par departement");
        job.setJarByClass(AccidentsDriver.class); // Jar partagé au cluster

        // Le petit fichier de lookup est copié sur chaque machine ; le "#communes.csv"
        // fixe le nom sous lequel le Mapper le retrouvera dans son répertoire de travail.
        job.addCacheFile(new URI(communesPath + "#communes.csv"));

        job.setMapperClass(AccidentsMapper.class);
        job.setReducerClass(AccidentsReducer.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(AccidentStatsWritable.class);

        FileInputFormat.addInputPath(job, new Path(accidentsPath));
        FileOutputFormat.setOutputPath(job, new Path(outputPath));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
