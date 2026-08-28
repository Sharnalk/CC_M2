import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { QuoteRequest } from '../../domain/types';
import { ResendEmailService } from '../../infrastructure/services/ResendEmailService';

interface QuoteFormModalProps {
  visible: boolean;
  onClose: () => void;
  trainingTitle: string;
  trainingSlug: string;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  visible,
  onClose,
  trainingTitle,
  trainingSlug,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Le nom est obligatoire.';
    if (!phone.trim()) newErrors.phone = 'Le numéro de téléphone est obligatoire.';

    if (!email.trim()) {
      newErrors.email = "L'adresse email est obligatoire.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "L'adresse email n'est pas valide.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const emailService = new ResendEmailService();
    const payload: QuoteRequest = {
      trainingTitle,
      trainingSlug,
      clientName: name.trim(),
      clientEmail: email.trim(),
      clientPhone: phone.trim(),
      companyName: company.trim() || undefined,
      message: message.trim() || undefined,
    };

    try {
      await emailService.sendQuoteRequest(payload);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de la demande.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Demander un Devis</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton} accessibilityLabel="Fermer le formulaire">
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>Demande Envoyée !</Text>
                <Text style={styles.successDescription}>
                  Votre demande de devis pour la formation <Text style={{ fontWeight: 'bold' }}>{trainingTitle}</Text> a été transmise avec succès. Nos équipes reviendront vers vous sous 24h.
                </Text>
                <TouchableOpacity style={styles.successButton} onPress={handleClose}>
                  <Text style={styles.successButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Info block */}
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Formation sélectionnée</Text>
                  <Text style={styles.infoValue}>{trainingTitle}</Text>
                </View>

                {error && (
                  <View style={styles.errorBlock}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                )}

                {/* Form fields */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Nom complet *</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Jean Dupont"
                    placeholderTextColor="#90A4AE"
                    value={name}
                    onChangeText={setName}
                  />
                  {errors.name && <Text style={styles.errorLabel}>{errors.name}</Text>}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Adresse Email *</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="jean.dupont@example.com"
                    placeholderTextColor="#90A4AE"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  {errors.email && <Text style={styles.errorLabel}>{errors.email}</Text>}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Téléphone *</Text>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="+33 6 12 34 56 78"
                    placeholderTextColor="#90A4AE"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                  {errors.phone && <Text style={styles.errorLabel}>{errors.phone}</Text>}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Nom de l'entreprise (Optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Dawan SAS"
                    placeholderTextColor="#90A4AE"
                    value={company}
                    onChangeText={setCompany}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Message / Besoins spécifiques (Optionnel)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Décrivez brièvement vos objectifs de formation ou contraintes de dates..."
                    placeholderTextColor="#90A4AE"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Envoyer ma demande</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  closeButton: {
    padding: 6,
  },
  closeIcon: {
    color: '#90A4AE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBlock: {
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D11919',
  },
  infoLabel: {
    fontSize: 10,
    color: '#D11919',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#263238',
  },
  errorBlock: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  errorText: {
    fontSize: 13,
    color: '#FF8F00',
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#455A64',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F7F8',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#263238',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  errorLabel: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#D11919',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D11919',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#E57373',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  successContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 350,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  successDescription: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  successButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default QuoteFormModal;
