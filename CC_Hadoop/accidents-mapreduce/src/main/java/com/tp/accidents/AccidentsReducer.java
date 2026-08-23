package com.tp.accidents;

import java.io.IOException;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/**
 * Additionne, pour chaque département, le total d'accidents et chacune des
 * 4 catégories de gravité reçues.
 */
public class AccidentsReducer extends Reducer<Text, AccidentStatsWritable, Text, AccidentStatsWritable> {

    @Override
    protected void reduce(Text key, Iterable<AccidentStatsWritable> values, Context context)
            throws IOException, InterruptedException {
        long total = 0;
        long tues = 0;
        long blessesHospitalises = 0;
        long blessesLegers = 0;
        long indemnes = 0;

        for (AccidentStatsWritable value : values) {
            total += value.getTotal();
            tues += value.getTues();
            blessesHospitalises += value.getBlessesHospitalises();
            blessesLegers += value.getBlessesLegers();
            indemnes += value.getIndemnes();
        }

        context.write(key, new AccidentStatsWritable(total, tues, blessesHospitalises, blessesLegers, indemnes));
    }
}
