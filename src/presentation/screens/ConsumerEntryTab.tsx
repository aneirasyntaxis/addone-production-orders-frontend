// Presentation - Consumer Entry Tab
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { useAdvancedProductsByConsumer } from '../hooks/useAdvancedProductsByConsumer';
import { useConsumerById } from '../hooks/useConsumerById';

interface ConsumerEntryTabProps {
  consumerId: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ConsumerEntryTab: React.FC<ConsumerEntryTabProps> = ({
  consumerId,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { data: entries, isLoading, error } = useAdvancedProductsByConsumer(consumerId);
  const { data: consumer } = useConsumerById(consumerId);

  // Calculate consumed quantities per line
  const getConsumedQuantities = () => {
    if (!consumer || !entries) {
      return {};
    }
    
    const consumed: { [lineNumber: number]: number } = {};
    
    entries.forEach(entry => {
      entry.documentLines?.forEach(line => {
        if (line.baseLine !== undefined) {
          consumed[line.baseLine] = (consumed[line.baseLine] || 0) + line.quantity;
        }
      });
    });
    
    return consumed;
  };

  // Check if all lines are fully consumed
  const areAllLinesConsumed = () => {
    if (!consumer || !entries) return false;
    
    const consumed = getConsumedQuantities();
    
    return consumer.documentLines.every(line => {
      if (line.lineNumber === undefined) return false;
      
      const lineNumber = line.lineNumber;
      const originalQuantity = line.quantity;
      const consumedQuantity = consumed[lineNumber] || 0;
      return consumedQuantity >= originalQuantity;
    });
  };

  const showCreateButton = !areAllLinesConsumed();

  const handleCreateEntry = () => {
    navigation.navigate('CreateAdvancedProduct', { consumerId });
  };

  const handleEntryPress = (entryId: number) => {
    navigation.navigate('AdvancedProductDetail', { id: entryId });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando entradas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error al cargar las entradas</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!entries || entries.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.placeholderText}>
              No hay entradas de mercancías asociadas a esta salida
            </Text>
          </Card>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.docEntry}
              onPress={() => handleEntryPress(entry.docEntry || 0)}
            >
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Entrada #{entry.docNum}</Text>
                  <Text style={styles.cardDate}>
                    {entry.docDueDate ? new Date(entry.docDueDate).toLocaleDateString() : ''}
                  </Text>
                </View>
                
                {entry.journalMemo && (
                  <Text style={styles.cardMemo} numberOfLines={1}>
                    {entry.journalMemo}
                  </Text>
                )}
                
                {entry.comments && (
                  <Text style={styles.cardComments} numberOfLines={2}>
                    {entry.comments}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardLines}>
                    {entry.documentLines?.length || 0} {entry.documentLines?.length === 1 ? 'línea' : 'líneas'}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {showCreateButton && (
        <TouchableOpacity onPress={handleCreateEntry} style={styles.fab}>
          <Text style={styles.fabIcon}>📋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  cardMemo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  cardComments: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cardLines: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: theme.colors.background,
  },
});
