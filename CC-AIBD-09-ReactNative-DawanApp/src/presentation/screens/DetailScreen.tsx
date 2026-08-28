import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrainingDetail } from '../hooks/useTrainingDetail';
import { DetailSkeleton, ErrorMessage } from '../components/UIState';
import QuoteFormModal from '../components/QuoteFormModal';

type RootStackParamList = {
  Home: undefined;
  Detail: { slug: string; title: string };
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

interface DetailScreenProps {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
}

// A simple HTML parsing utility to render plan content beautifully into native Text components
const renderHtmlPlan = (htmlString: string) => {
  if (!htmlString) return null;

  // Clean raw HTML entities
  let cleanText = htmlString
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&acirc;/g, 'â')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&icirc;/g, 'î')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&deg;/g, '°')
    .replace(/&euml;/g, 'ë')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const elements = cleanText.split(/(<\/h4>|<\/p>|<p>|<h4>)/gi);
  const components: React.ReactNode[] = [];

  let currentTag = '';

  elements.forEach((segment, idx) => {
    const trimmed = segment.trim();
    if (!trimmed) return;

    const lowerSegment = trimmed.toLowerCase();
    if (lowerSegment === '<h4>' || lowerSegment === '</h4>' || lowerSegment === '<p>' || lowerSegment === '</p>') {
      currentTag = lowerSegment;
      return;
    }

    let innerText = trimmed
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>|<\/strong>/gi, '')
      .replace(/<span[^>]*>|<\/span>/gi, '')
      .replace(/<div[^>]*>|<\/div>/gi, '');

    if (currentTag === '<h4>') {
      components.push(
        <Text key={`h4-${idx}`} style={styles.planHeading}>
          {innerText}
        </Text>
      );
    } else {
      components.push(
        <Text key={`p-${idx}`} style={styles.planParagraph}>
          {innerText}
        </Text>
      );
    }
  });

  return <View style={styles.planContainer}>{components}</View>;
};

export const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { slug, title } = route.params;
  const { training, loading, error, refresh } = useTrainingDetail(slug);
  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !training) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorMessage message={error || 'Formation introuvable.'} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Title Area */}
        <View style={styles.headerCard}>
          <Text style={styles.refText}>Réf : {training.reference || 'N/A'}</Text>
          <Text style={styles.title}>{training.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DURÉE</Text>
              <Text style={styles.statValue}>⏱️ {training.duration} {parseInt(training.duration, 10) > 1 ? 'jours' : 'jour'}</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statLabel}>TARIF</Text>
              <Text style={[styles.statValue, styles.priceText]}>
                {training.standardPrice ? `${training.standardPrice} €` : 'Sur devis'}
              </Text>
            </View>
          </View>
        </View>

        {/* Objectives Section */}
        {training.objectives && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objectifs pédagogiques</Text>
            <Text style={styles.bodyText}>{training.objectives.replace(/\r\n/g, '\n')}</Text>
          </View>
        )}

        {/* Prerequisites Section */}
        {training.prerequisites && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prérequis</Text>
            <Text style={styles.bodyText}>{training.prerequisites.replace(/\r\n/g, '\n')}</Text>
          </View>
        )}

        {/* Training Syllabus (Plan) Section */}
        {training.plan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programme de formation</Text>
            {renderHtmlPlan(training.plan)}
          </View>
        )}

        {/* Audience / Logistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Public & Organisation</Text>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Public visé</Text>
              <Text style={styles.gridValue}>{training.audience || 'Tout public'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Type de formation</Text>
              <Text style={styles.gridValue}>
                {training.type === 'shared' ? 'Présentiel / Distanciel' : 'Sur-mesure'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Devis Request Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.quoteButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.quoteButtonText}>Demander un Devis Gratuit</Text>
        </TouchableOpacity>
      </View>

      {/* Devis Form Modal */}
      <QuoteFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        trainingTitle={training.title}
        trainingSlug={training.slug}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // Make room for floating footer
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  refText: {
    fontSize: 11,
    color: '#90A4AE',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
    lineHeight: 28,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#F1F3F4',
  },
  statLabel: {
    fontSize: 10,
    color: '#90A4AE',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#37474F',
  },
  priceText: {
    color: '#D11919',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D11919',
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#D11919',
    paddingLeft: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#455A64',
    lineHeight: 22,
  },
  planContainer: {
    marginTop: 8,
  },
  planHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#263238',
    marginTop: 14,
    marginBottom: 6,
  },
  planParagraph: {
    fontSize: 13,
    color: '#546E7A',
    lineHeight: 20,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: '#90A4AE',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 13,
    color: '#37474F',
    fontWeight: '500',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  quoteButton: {
    backgroundColor: '#D11919',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default DetailScreen;
