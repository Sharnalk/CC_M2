import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchFilterBar from '../presentation/components/SearchFilterBar';

describe('SearchFilterBar Component', () => {
  it('renders search input and duration chips correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchFilterBar
        searchQuery=""
        onSearchChange={() => {}}
        selectedDuration="all"
        onDurationChange={() => {}}
      />
    );

    expect(getByPlaceholderText('Rechercher une formation...')).toBeTruthy();
    expect(getByText('Tous')).toBeTruthy();
    expect(getByText('1 Jour')).toBeTruthy();
    expect(getByText('2-3 Jours')).toBeTruthy();
    expect(getByText('4+ Jours')).toBeTruthy();
  });

  it('triggers onSearchChange when user types', () => {
    const onSearchChangeMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchFilterBar
        searchQuery=""
        onSearchChange={onSearchChangeMock}
        selectedDuration="all"
        onDurationChange={() => {}}
      />
    );

    const input = getByPlaceholderText('Rechercher une formation...');
    fireEvent.changeText(input, 'Docker');
    
    expect(onSearchChangeMock).toHaveBeenCalledWith('Docker');
  });

  it('triggers onDurationChange when a chip is pressed', () => {
    const onDurationChangeMock = jest.fn();
    const { getByText } = render(
      <SearchFilterBar
        searchQuery=""
        onSearchChange={() => {}}
        selectedDuration="all"
        onDurationChange={onDurationChangeMock}
      />
    );

    fireEvent.press(getByText('2-3 Jours'));
    expect(onDurationChangeMock).toHaveBeenCalledWith('short');
  });
});
