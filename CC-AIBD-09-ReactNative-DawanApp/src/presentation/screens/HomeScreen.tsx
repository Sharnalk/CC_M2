import React from 'react';
import { StyleSheet, View, FlatList, Text, RefreshControl, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrainings } from '../hooks/useTrainings';
import TrainingCard from '../components/TrainingCard';
import SearchFilterBar from '../components/SearchFilterBar';
import { TrainingCardSkeleton, ErrorMessage } from '../components/UIState';

type RootStackParamList = {
  Home: undefined;
  Detail: { slug: string; title: string };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    trainings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDuration,
    setSelectedDuration,
    refresh,
  } = useTrainings();

  const handlePressCard = (slug: string, title: string) => {
    navigation.navigate('Detail', { slug, title });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TrainingCard training={item} onPress={() => handlePressCard(item.slug, item.title)} />
  );

  const renderContent = () => {
    if (loading && trainings.length === 0) {
      return (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <TrainingCardSkeleton />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (error && trainings.length === 0) {
      return <ErrorMessage message={error} onRetry={refresh} />;
    }

    return (
      <FlatList
        data={trainings}
        keyExtractor={(item) => item.slug}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && trainings.length > 0} onRefresh={refresh} colors={['#D11919']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Aucune formation ne correspond à vos critères.</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Banner Title */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Formations Dawan</Text>
          <Text style={styles.bannerSubtitle}>Découvrez notre catalogue officiel</Text>
        </View>

        {/* Search & Filter bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
        />

        {/* Catalog Content */}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  banner: {
    backgroundColor: '#D11919',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
  },
});

export default HomeScreen;
