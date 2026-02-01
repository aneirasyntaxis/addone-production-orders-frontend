// Presentation - Consumers Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
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
  const [searchText, setSearchText] = React.useState('');
  const [searchNumber, setSearchNumber] = React.useState<number | undefined>(undefined);
  const { data: consumers, isLoading, error, refetch, isRefetching } = useConsumers(searchNumber);

  // Debounce search - búsqueda automática después de 850ms de inactividad
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 850);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Log errors to console when they occur
  React.useEffect(() => {
    if (error) {
      logger.error('ConsumersScreen: Error fetching consumers', error);
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
    navigation.navigate('CreateConsumerFromSales');
  };

  const handleSearch = () => {
    const numericValue = searchText.trim() === '' ? undefined : parseInt(searchText, 10);
    if (searchText.trim() !== '' && isNaN(numericValue!)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor ingrese solo números',
      });
      return;
    }
    setSearchNumber(numericValue);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchNumber(undefined);
  };

  const renderConsumerItem = ({ item }: { item: Consumer }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ConsumerDetail', { id: item.docEntry || 0 })}
      activeOpacity={0.7}
    >
      <Card style={styles.consumerCard}>
      <View style={styles.consumerHeader}>
        <View style={styles.consumerHeaderLeft}>
          <Text style={styles.consumerNumber}>Salida #{item.docNum}</Text>
        </View>
        <View style={styles.consumerHeaderRight}>
          <Text style={styles.linesCount}>📦 {item.documentLines.length}</Text>
          <Text style={styles.linesLabel}>{item.documentLines.length === 1 ? 'Producto' : 'Productos'}</Text>
        </View>
      </View>

      <View style={styles.consumerContent}>
        {item.docDate && (
          <View style={styles.consumerRow}>
            <Text style={styles.consumerLabel}>Fecha:</Text>
            <Text style={styles.consumerValue}>
              {item.docDate.split('-').reverse().join('/')}
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
        </View>
      </Card>
    </TouchableOpacity>
  );  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Salidas" subtitle="Salidas de mercancías" variant="accent" />
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
      <Header title="Salidas" subtitle="Salidas de mercancías" variant="accent" />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de salida"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          keyboardType="numeric"
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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
            <Text style={styles.emptyText}>No hay salidas registradas</Text>
            <Text style={styles.emptySubtext}>Las salidas creadas aparecerán aquí</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButton: {
    position: 'absolute',
    right: theme.spacing.md + theme.spacing.sm,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 12,
  },
  clearButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
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
  consumerHeaderRight: {
    alignItems: 'flex-end',
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
  linesCount: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  linesLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
