import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDuration: string; // 'all' | '1' | 'short' | 'long'
  onDurationChange: (duration: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedDuration,
  onDurationChange,
}) => {
  const durationFilters = [
    { label: 'Tous', value: 'all' },
    { label: '1 Jour', value: '1' },
    { label: '2-3 Jours', value: 'short' },
    { label: '4+ Jours', value: 'long' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Rechercher une formation..."
          placeholderTextColor="#90A4AE"
          value={searchQuery}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.filterTitle}>Durée de la formation</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {durationFilters.map((filter) => {
          const isSelected = selectedDuration === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.chip, isSelected && styles.selectedChip]}
              onPress={() => onDurationChange(filter.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#263238',
    height: '100%',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: '#90A4AE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78909C',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  filterScroll: {
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#F5F7F8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  selectedChip: {
    backgroundColor: '#D11919',
    borderColor: '#D11919',
  },
  chipText: {
    fontSize: 13,
    color: '#546E7A',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SearchFilterBar;
