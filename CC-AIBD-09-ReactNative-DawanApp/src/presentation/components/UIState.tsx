/**
 * Composants d'état de l'interface : chargement (skeletons) et erreur.
 * Ils sont regroupés ici car ils partagent le même rôle (afficher un état
 * transitoire plutôt que du contenu métier) et font chacun quelques
 * dizaines de lignes.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ViewStyle,
  DimensionValue,
} from 'react-native';

/* -------------------------------------------------------------------------- */
/*                                  Skeletons                                 */
/* -------------------------------------------------------------------------- */

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[skeletonStyles.skeleton, { width, height, borderRadius, opacity }, style]}
    />
  );
};

export const TrainingCardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="70%" height={22} style={skeletonStyles.title} />
      <View style={skeletonStyles.row}>
        <Skeleton width="25%" height={16} />
        <Skeleton width="35%" height={16} style={skeletonStyles.price} />
      </View>
      <Skeleton width="100%" height={40} style={skeletonStyles.description} />
      <View style={skeletonStyles.footer}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.container}>
      <Skeleton width="90%" height={32} style={skeletonStyles.detailTitle} />
      <View style={skeletonStyles.badgeRow}>
        <Skeleton width="25%" height={24} borderRadius={12} />
        <Skeleton width="30%" height={24} borderRadius={12} style={{ marginLeft: 8 }} />
      </View>
      <View style={skeletonStyles.section}>
        <Skeleton width="40%" height={20} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="85%" height={16} />
      </View>
      <View style={skeletonStyles.section}>
        <Skeleton width="50%" height={20} style={{ marginBottom: 12 }} />
        <Skeleton width="100%" height={120} borderRadius={8} />
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Erreur                                   */
/* -------------------------------------------------------------------------- */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View style={errorStyles.container}>
      <View style={errorStyles.card}>
        <Text style={errorStyles.icon}>❌</Text>
        <Text style={errorStyles.title}>Une erreur est survenue</Text>
        <Text style={errorStyles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={errorStyles.button} onPress={onRetry} activeOpacity={0.8}>
            <Text style={errorStyles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const skeletonStyles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  title: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    marginLeft: 10,
  },
  description: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F9FB',
  },
  detailTitle: {
    marginTop: 20,
    marginBottom: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F9FB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  icon: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#D11919',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
