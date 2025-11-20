// Presentation - Consumers Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { SkeletonCard } from '../components/Skeleton';
import { FAB } from '../components/FAB';
import { Button } from '../components/Button';
import { useConsumers } from '../hooks/useConsumers';
import { Consumer } from '../../domain/entities/consumer.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

export const ConsumersScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: consumers, isLoading, error, refetch, isRefetching } = useConsumers();

  // Log errors to console when they occur
  React.useEffect(() => {
    if (error) {
      logger.error('ConsumersScreen: Error fetching consumers', error);
      console.error('🔴 Consumers Error:', error);
    }
  }, [error]);

  // Log successful data load
  React.useEffect(() => {
    if (consumers) {
      logger.info('ConsumersScreen: Consumers loaded', { count: consumers.length });
    }
  }, [consumers]);

  const handleCreateConsumption = () => {
    logger.info('ConsumersScreen: Create consumption button pressed');
    // TODO: Navigate to create consumption screen
    Toast.show({
      type: 'info',
      text1: 'Crear Consumo',
      text2: 'Función en desarrollo',
    });
  };

  const renderConsumerItem = ({ item }: { item: Consumer }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ConsumerDetail', { id: item.docEntry || 0 })}
      activeOpacity={0.7}
    >
      <Card style={styles.consumerCard}>
      <View style={styles.consumerHeader}>
        <View style={styles.consumerHeaderLeft}>
          <Text style={styles.consumerNumber}>Consumo #{item.docNum}</Text>
          <Text style={styles.docEntry}>ID: {item.docEntry}</Text>
        </View>
      </View>

      <View style={styles.consumerContent}>
        {item.docDate && (
          <View style={styles.consumerRow}>
            <Text style={styles.consumerLabel}>Fecha:</Text>
            <Text style={styles.consumerValue}>
              {new Date(item.docDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
        )}
        {item.comments && (
          <View style={styles.consumerRow}>
            <Text style={styles.consumerLabel}>Comentarios:</Text>
            <Text style={styles.consumerValue}>{item.comments}</Text>
          </View>
        )}
        {item.journalMemo && (
          <View style={styles.consumerRow}>
            <Text style={styles.consumerLabel}>Memo:</Text>
            <Text style={styles.consumerValue}>{item.journalMemo}</Text>
          </View>
        )}
        <View style={styles.linesInfo}>
          <Text style={styles.linesText}>
            📦 {item.documentLines.length} líneas de consumo
          </Text>
        </View>
        </View>
      </Card>
    </TouchableOpacity>
  );  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Consumos" subtitle="Materiales Consumidos" variant="accent" />
        <View style={styles.listContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
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
      <Header title="Consumos" subtitle="Materiales Consumidos" variant="accent" />

      {/* Consumers List */}
      <FlatList
        data={consumers || []}
        renderItem={renderConsumerItem}
        keyExtractor={(item) => item.docEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay consumos registrados</Text>
            <Text style={styles.emptySubtext}>Los consumos creados aparecerán aquí</Text>
          </View>
        }
      />

      {/* FAB Button */}
      <FAB onPress={handleCreateConsumption} />

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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 80, // Extra padding for FAB
  },
  consumerCard: {
    marginBottom: theme.spacing.md,
  },
  consumerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  consumerHeaderLeft: {
    flex: 1,
  },
  consumerNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  docEntry: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  consumerContent: {
    gap: theme.spacing.sm,
  },
  consumerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  consumerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  consumerValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  linesInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  linesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
