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
import { FAB } from '../components/FAB';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useAuth } from '../context/AuthContext';
import { ProductionOrder } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';
import { formatThousands } from '../../core/utils/number-formatter';

export const HomeScreen: React.FC = () => {
  const { session } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchText, setSearchText] = React.useState('');
  const [searchNumber, setSearchNumber] = React.useState<number | undefined>(undefined);
  const { data: orders, isLoading, error, refetch, isRefetching } = useProductionOrders(searchNumber);
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
  const startY = React.useRef(0);
  const scrollY = React.useRef(0);

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
      logger.error('HomeScreen: Production orders error', error);

    }
  }, [error]);

  // Pull-to-refresh para web
  const handleScroll = (event: any) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  };

  const handleTouchStart = (event: any) => {
    if (scrollY.current <= 0) {
      startY.current = event.nativeEvent.pageY;
    }
  };

  const handleTouchMove = (event: any) => {
    if (scrollY.current <= 0 && startY.current > 0) {
      const currentY = event.nativeEvent.pageY;
      const distance = currentY - startY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > 80) {
      refetch();
    }
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
  };

  // Log successful data load
  React.useEffect(() => {
    if (orders) {
      logger.info('HomeScreen: Orders loaded', { count: orders.length });
    }
  }, [orders]);

  const handleCreateOrder = () => {
    logger.info('HomeScreen: Create order button pressed');
    navigation.navigate('CreateProductionOrder');
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

  const renderOrderItem = ({ item }: { item: ProductionOrder }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductionOrderDetail', { id: item.absoluteEntry || 0 })}
      activeOpacity={0.7}
    >
      <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderNumber}>OF #{item.documentNumber || 'N/A'}</Text>
        </View>
        <View style={styles.orderHeaderCenter}>
          <View style={[styles.consumptionBadge, getConsumptionStyle(getConsumptionStatus(item))]}>
            <Text style={styles.consumptionText}>{getConsumptionStatus(item)}</Text>
          </View>
          <View style={[styles.receiptBadge, getReceiptStyle(getReceiptStatus(item))]}>
            <Text style={styles.receiptText}>{getReceiptStatus(item)}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(item.productionOrderStatus)]}>
            <Text style={styles.statusText}>{getStatusText(item.productionOrderStatus)}</Text>
          </View>
        </View>
        <View style={styles.orderHeaderRight}>
          <Text style={styles.materialsCount}>📦 {item.productionOrderLines.length}</Text>
          <Text style={styles.materialsLabel}>{item.productionOrderLines.length === 1 ? 'material' : 'materiales'}</Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Producto:</Text>
          <Text style={styles.orderValue}>{item.itemNo}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Cantidad:</Text>
          <Text style={styles.orderValue}>{formatThousands(item.plannedQuantity)}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Fecha entrega:</Text>
          <Text style={styles.orderValue}>
            {item.dueDate.split('-').reverse().join('/')}
          </Text>
        </View>
        {item.remarks && (
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Observaciones:</Text>
            <Text style={styles.orderValue}>{item.remarks}</Text>
          </View>
        )}
        </View>
      </Card>
    </TouchableOpacity>
  );  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'boposreleased':
        return styles.statusReleased;
      case 'boposplanned':
        return styles.statusPlanned;
      case 'boposclosed':
        return styles.statusClosed;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'boposreleased':
        return 'Liberada';
      case 'boposplanned':
        return 'Planificada';
      case 'boposclosed':
        return 'Cerrada';
      default:
        return status || 'N/A';
    }
  };

  const getConsumptionStatus = (order: ProductionOrder): string => {
    // Filtrar solo líneas que no sean texto
    const materialLines = order.productionOrderLines.filter(line => line.itemType !== 'pit_Text');
    
    if (materialLines.length === 0) return '📋 Sin Emisión';
    
    let totalLines = 0;
    let partialLines = 0;
    let noConsumptionLines = 0;
    
    materialLines.forEach(line => {
      const planned = line.plannedQuantity || 0;
      const issued = line.issuedQuantity || 0;
      
      if (issued === 0) {
        noConsumptionLines++;
      } else if (issued >= planned) {
        totalLines++;
      } else {
        partialLines++;
      }
    });
    
    // Todas consumidas totalmente
    if (totalLines === materialLines.length) {
      return '📋 Emisión Completada';
    }
    
    // Al menos una línea con consumo parcial o total
    if (partialLines > 0 || totalLines > 0) {
      return '📋 Emisión Parcial';
    }
    
    // Sin consumo
    return '📋 Sin Emisión';
  };

  const getConsumptionStyle = (status: string) => {
    switch (status) {
      case '📋 Emisión Completada':
        return styles.consumptionTotal;
      case '📋 Emisión Parcial':
        return styles.consumptionPartial;
      case '📋 Sin Emisión':
        return styles.consumptionNone;
      default:
        return styles.consumptionNone;
    }
  };

  const getReceiptStatus = (order: ProductionOrder): string => {
    const planned = order.plannedQuantity || 0;
    const completed = order.completedQuantity || 0;
    
    if (completed === 0) {
      return '📦 Sin Recibo';
    }
    
    if (completed >= planned) {
      return '📦 Recibo Completado';
    }
    
    return '📦 Recibo Parcial';
  };

  const getReceiptStyle = (status: string) => {
    switch (status) {
      case '📦 Recibo Completado':
        return styles.consumptionTotal;
      case '📦 Recibo Parcial':
        return styles.consumptionPartial;
      case '📦 Sin Recibo':
        return styles.consumptionNone;
      default:
        return styles.consumptionNone;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Órdenes de Fabricación" subtitle="Gestiona tus órdenes de producción" />
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
      <Header title="Órdenes de Fabricación" subtitle="Gestiona tus órdenes de producción" />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número de orden de fabricación"
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

      {/* Orders List */}
      {isPulling && (
        <View style={[styles.pullIndicator, { opacity: Math.min(pullDistance / 80, 1) }]}>
          <Text style={styles.pullText}>↓ {pullDistance > 80 ? 'Suelta para actualizar' : 'Desliza para actualizar'}</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.absoluteEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay órdenes de fabricación</Text>
            <Text style={styles.emptySubtext}>Las órdenes creadas aparecerán aquí</Text>
          </View>
        }
      />

      {/* FAB Button */}
      <FAB onPress={handleCreateOrder} />

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
  pullIndicator: {
    position: 'absolute',
    top: 160,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: theme.colors.surface,
  },
  pullText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 80, // Extra padding for FAB
  },
  orderCard: {
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderCenter: {
    alignItems: 'center',
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  materialsCount: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  materialsLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  absoluteEntry: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.background,
  },
  consumptionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  consumptionText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.background,
  },
  consumptionTotal: {
    backgroundColor: '#10b981', // green-500
  },
  consumptionPartial: {
    backgroundColor: '#f59e0b', // amber-500
  },
  consumptionNone: {
    backgroundColor: '#6b7280', // gray-500
  },
  receiptBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  receiptText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.background,
  },
  receiptTotal: {
    backgroundColor: '#8b5cf6', // violet-500
  },
  receiptPartial: {
    backgroundColor: '#ec4899', // pink-500
  },
  receiptNone: {
    backgroundColor: '#9ca3af', // gray-400
  },
  statusReleased: {
    backgroundColor: theme.colors.success,
  },
  statusPlanned: {
    backgroundColor: '#3b82f6',
  },
  statusClosed: {
    backgroundColor: theme.colors.textSecondary,
  },
  statusDefault: {
    backgroundColor: theme.colors.primary,
  },
  orderContent: {
    gap: theme.spacing.sm,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  orderValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  remarksContainer: {
    marginTop: theme.spacing.xs,
  },
  remarksText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
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
