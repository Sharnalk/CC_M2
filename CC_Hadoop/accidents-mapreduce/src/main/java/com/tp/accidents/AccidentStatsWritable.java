package com.tp.accidents;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

import org.apache.hadoop.io.Writable;

/**
 * Porte, pour une même clé (un département) :
 *  - la FRÉQUENCE : le nombre total d'accidents
 *  - la GRAVITÉ   : le détail par catégorie de blessure (tués, blessés
 *                   hospitalisés, blessés légers, indemnes)
 *
 * C'est l'équivalent Hadoop d'une petite classe Java avec plusieurs champs :
 * il faut juste lui apprendre à se sérialiser (write) et se désérialiser
 * (readFields) pour que Hadoop puisse l'envoyer sur le réseau pendant le
 * Shuffle, comme il sait déjà le faire pour IntWritable ou Text.
 */
public class AccidentStatsWritable implements Writable {

    private long total;
    private long tues;
    private long blessesHospitalises;
    private long blessesLegers;
    private long indemnes;

    /** Constructeur vide obligatoire : Hadoop l'utilise pour recréer l'objet
     *  côté Reducer avant d'appeler readFields(). */
    public AccidentStatsWritable() {
    }

    public AccidentStatsWritable(long total, long tues, long blessesHospitalises,
                                  long blessesLegers, long indemnes) {
        this.total = total;
        this.tues = tues;
        this.blessesHospitalises = blessesHospitalises;
        this.blessesLegers = blessesLegers;
        this.indemnes = indemnes;
    }

    public long getTotal() {
        return total;
    }

    public long getTues() {
        return tues;
    }

    public long getBlessesHospitalises() {
        return blessesHospitalises;
    }

    public long getBlessesLegers() {
        return blessesLegers;
    }

    public long getIndemnes() {
        return indemnes;
    }

    @Override
    public void write(DataOutput out) throws IOException {
        out.writeLong(total);
        out.writeLong(tues);
        out.writeLong(blessesHospitalises);
        out.writeLong(blessesLegers);
        out.writeLong(indemnes);
    }

    @Override
    public void readFields(DataInput in) throws IOException {
        total = in.readLong();
        tues = in.readLong();
        blessesHospitalises = in.readLong();
        blessesLegers = in.readLong();
        indemnes = in.readLong();
    }

    @Override
    public String toString() {
        return "total=" + total
                + ", tues=" + tues
                + ", blessesHospitalises=" + blessesHospitalises
                + ", blessesLegers=" + blessesLegers
                + ", indemnes=" + indemnes;
    }
}
