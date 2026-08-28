import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import QuoteFormModal from '../presentation/components/QuoteFormModal';
import { ResendEmailService } from '../infrastructure/services/ResendEmailService';

jest.mock('../infrastructure/services/ResendEmailService');

describe('QuoteFormModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fields correctly when open', () => {
    const { getByText, getByPlaceholderText } = render(
      <QuoteFormModal
        visible={true}
        onClose={() => {}}
        trainingTitle="React Native"
        trainingSlug="react-native"
      />
    );

    expect(getByText('Demander un Devis')).toBeTruthy();
    expect(getByPlaceholderText('Jean Dupont')).toBeTruthy();
    expect(getByPlaceholderText('jean.dupont@example.com')).toBeTruthy();
    expect(getByPlaceholderText('+33 6 12 34 56 78')).toBeTruthy();
  });

  it('validates mandatory fields and email format', async () => {
    const { getByText, queryByText } = render(
      <QuoteFormModal
        visible={true}
        onClose={() => {}}
        trainingTitle="React Native"
        trainingSlug="react-native"
      />
    );

    const submitBtn = getByText('Envoyer ma demande');
    fireEvent.press(submitBtn);

    // Assert that validation errors appear
    expect(getByText('Le nom est obligatoire.')).toBeTruthy();
    expect(getByText("L'adresse email est obligatoire.")).toBeTruthy();
    expect(getByText('Le numéro de téléphone est obligatoire.')).toBeTruthy();
  });

  it('successfully submits and shows success view when inputs are valid', async () => {
    const sendQuoteMock = jest.fn().mockResolvedValue(undefined);
    (ResendEmailService as jest.Mock).mockImplementation(() => ({
      sendQuoteRequest: sendQuoteMock,
    }));

    const { getByText, getByPlaceholderText } = render(
      <QuoteFormModal
        visible={true}
        onClose={() => {}}
        trainingTitle="React Native"
        trainingSlug="react-native"
      />
    );

    fireEvent.changeText(getByPlaceholderText('Jean Dupont'), 'Alice V');
    fireEvent.changeText(getByPlaceholderText('jean.dupont@example.com'), 'alice@dawan.fr');
    fireEvent.changeText(getByPlaceholderText('+33 6 12 34 56 78'), '0611223344');

    const submitBtn = getByText('Envoyer ma demande');
    
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(sendQuoteMock).toHaveBeenCalledWith({
        trainingTitle: 'React Native',
        trainingSlug: 'react-native',
        clientName: 'Alice V',
        clientEmail: 'alice@dawan.fr',
        clientPhone: '0611223344',
        companyName: undefined,
        message: undefined,
      });
      expect(getByText('Demande Envoyée !')).toBeTruthy();
    });
  });
});
