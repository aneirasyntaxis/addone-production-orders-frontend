// Presentation - Consumer Detail Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { SkeletonDetail } from '../components/Skeleton';
import { Button } from '../components/Button';
import { useConsumerById } from '../hooks/useConsumerById';
import { Consumer, ConsumerLine } from '../../domain/entities/consumer.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'ConsumerDetail'>;

export const ConsumerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { data: consumer, isLoading, error, refetch } = useConsumerById(id);

  React.useEffect(() => {
    if (error) {
      logger.error('ConsumerDetailScreen: Error fetching consumer', error);
      console.error('🔴 Consumer Detail Error:', error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cargando...</Text>
        </View>
        <SkeletonDetail />
      </SafeAreaView>
    );
  }

  if (error || !consumer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Consumo</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{handleError(error)}</Text>
          <Button title="Reintentar" onPress={() => refetch()} style={styles.retryButton} />
        </View>
        <Toast />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consumo #{consumer.docNum}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Número Documento:</Text>
            <Text style={styles.value}>{consumer.docNum}</Text>
          </View>
          {consumer.series && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Serie:</Text>
              <Text style={styles.value}>{consumer.series}</Text>
            </View>
          )}
          {consumer.docDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha Documento:</Text>
              <Text style={styles.value}>
                {new Date(consumer.docDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
          {consumer.docDueDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha Vencimiento:</Text>
              <Text style={styles.value}>
                {new Date(consumer.docDueDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
          {consumer.taxDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha Impuesto:</Text>
              <Text style={styles.value}>
                {new Date(consumer.taxDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
          {consumer.reference1 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Referencia 1:</Text>
              <Text style={styles.value}>{consumer.reference1}</Text>
            </View>
          )}
          {consumer.reference2 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Referencia 2:</Text>
              <Text style={styles.value}>{consumer.reference2}</Text>
            </View>
          )}
          {consumer.comments && (
            <View style={styles.remarksContainer}>
              <Text style={styles.label}>Comentarios:</Text>
              <Text style={styles.remarksText}>{consumer.comments}</Text>
            </View>
          )}
          {consumer.journalMemo && (
            <View style={styles.remarksContainer}>
              <Text style={styles.label}>Comentarios:</Text>
              <Text style={styles.remarksText}>{consumer.journalMemo}</Text>
            </View>
          )}
        </Card>

        {/* Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            Detalle ({consumer.documentLines.length})
          </Text>
          {consumer.documentLines.map((line: ConsumerLine, index: number) => (
            <View key={index} style={styles.lineItem}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineNumber}>Línea {line.lineNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Código Producto:</Text>
                <Text style={styles.value}>{line.itemCode || 'N/A'}</Text>
              </View>
              {line.itemDescription && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Descripción:</Text>
                  <Text style={styles.value}>{line.itemDescription}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cantidad:</Text>
                <Text style={styles.value}>{line.quantity || 0}</Text>
              </View>
              {line.warehouseCode && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Almacén:</Text>
                  <Text style={styles.value}>{line.warehouseCode}</Text>
                </View>
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.text,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  remarksContainer: {
    marginTop: theme.spacing.sm,
  },
  remarksText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  lineItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lineHeader: {
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lineNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    width: '100%',
  },
});
