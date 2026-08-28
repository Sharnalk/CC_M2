import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TrainingCard from '../presentation/components/TrainingCard';
import { Training } from '../domain/types';

const mockTraining: Training = {
  title: 'React Native Expert',
  cpfCode: null,
  edofTitle: null,
  duration: '5',
  description: 'Learn React Native',
  formacode: 12345,
  slug: 'react-native-expert',
  alias: 'react-native-expert',
  fullAlias: '/formations/react-native-expert',
  path: '/formations/react-native-expert',
  type: 'shared',
  standardPrice: 1500,
  customPrice: 1200,
  customPriceExtra: 50,
  remotelyPrice: 1500,
  objectives: 'Build outstanding cross-platform apps.',
  prerequisites: 'JavaScript knowledge.',
  trainingOrder: 1,
  certification: null,
};

describe('TrainingCard Component', () => {
  it('renders training details correctly', () => {
    const { getByText } = render(
      <TrainingCard training={mockTraining} onPress={() => {}} />
    );

    expect(getByText('React Native Expert')).toBeTruthy();
    expect(getByText('⏱️ 5 jours')).toBeTruthy();
    expect(getByText('Inter-entreprises')).toBeTruthy();
    expect(getByText('1500 €')).toBeTruthy();
    expect(getByText('Build outstanding cross-platform apps.')).toBeTruthy();
  });

  it('triggers onPress callback when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TrainingCard training={mockTraining} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Voir détails →'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
