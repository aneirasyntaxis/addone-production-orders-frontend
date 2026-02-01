// Presentation - Advanced Products Screen
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
import { Button } from '../components/Button';
import { useAdvancedProducts } from '../hooks/useAdvancedProducts';
import { AdvancedProduct } from '../../domain/entities/advanced-product.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

export const AdvancedProductsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = React.useState('');
  const [searchNumber, setSearchNumber] = React.useState<number | undefined>(undefined);
  const { data: products, isLoading, error, refetch, isRefetching } = useAdvancedProducts(searchNumber);

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
      logger.error('AdvancedProductsScreen: Error fetching products', error);
    }
  }, [error]);

  // Log successful data load
  React.useEffect(() => {
    if (products) {
      logger.info('AdvancedProductsScreen: Products loaded', { count: products.length });
    }
  }, [products]);

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

  const renderProductItem = ({ item }: { item: AdvancedProduct }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AdvancedProductDetail', { id: item.docEntry || 0 })}
      activeOpacity={0.7}
    >
      <Card style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productHeaderLeft}>
          <Text style={styles.productNumber}>Entrada #{item.docNum || 'N/A'}</Text>
          <Text style={styles.docEntry}>ID: {item.docEntry}</Text>
        </View>
      </View>

      <View style={styles.productContent}>
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Fecha entrega:</Text>
          <Text style={styles.productValue}>
            {new Date(item.docDueDate).toLocaleDateString('es-ES')}
          </Text>
        </View>
        {item.comments && (
          <View style={styles.productRow}>
            <Text style={styles.productLabel}>Comentarios:</Text>
            <Text style={styles.productValue}>{item.comments}</Text>
          </View>
        )}
        {item.journalMemo && (
          <View style={styles.productRow}>
            <Text style={styles.productLabel}>Memo:</Text>
            <Text style={styles.productValue}>{item.journalMemo}</Text>
          </View>
        )}
        <View style={styles.linesInfo}>
          <Text style={styles.linesText}>
            📦 {item.documentLines.length} líneas de producto
          </Text>
        </View>
        </View>
      </Card>
    </TouchableOpacity>
  );  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Entradas de Mercancías" subtitle="Entradas" variant="success" />
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
      <Header title="Entradas de Mercancías" subtitle="Entradas" variant="success" />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de entrada"
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

      {/* Products List */}
      <FlatList
        data={products || []}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.docEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay entradas registradas</Text>
            <Text style={styles.emptySubtext}>Las entradas creadas aparecerán aquí</Text>
          </View>
        }
      />

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
  },
  productCard: {
    marginBottom: theme.spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productHeaderLeft: {
    flex: 1,
  },
  productNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  docEntry: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  productContent: {
    gap: theme.spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  productLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  productValue: {
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
