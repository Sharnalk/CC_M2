import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Training } from '../../domain/types';

interface TrainingCardProps {
  training: Training;
  onPress: () => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ training, onPress }) => {
  const { title, duration, standardPrice, type, objectives } = training;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⏱️ {duration} {parseInt(duration, 10) > 1 ? 'jours' : 'jour'}</Text>
        </View>
        <View style={[styles.badge, styles.typeBadge]}>
          <Text style={styles.typeBadgeText}>{type === 'shared' ? 'Inter-entreprises' : type}</Text>
        </View>
      </View>

      {objectives ? (
        <Text style={styles.objectives} numberOfLines={3}>
          {objectives.replace(/\r\n/g, ' ').replace(/\n/g, ' ')}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Tarif standard</Text>
          <Text style={styles.price}>{standardPrice ? `${standardPrice} €` : 'Sur devis'}</Text>
        </View>
        <View style={styles.actionButton}>
          <Text style={styles.actionText}>Voir détails →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#546E7A',
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: '#E8F5E9',
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  objectives: {
    fontSize: 13,
    color: '#78909C',
    lineHeight: 18,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 10,
    color: '#90A4AE',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D11919',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#FFF2F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#D11919',
    fontWeight: 'bold',
  },
});

export default TrainingCard;
