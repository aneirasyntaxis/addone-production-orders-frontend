import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { useProductionOrders } from '../hooks/useProductionOrders';
import { useAuth } from '../context/AuthContext';
import { ProductionOrder } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

export const HomeScreen: React.FC = () => {
  const { session } = useAuth();
  const { data: orders, isLoading, error, refetch, isRefetching } = useProductionOrders();

  // Log errors to console when they occur
  React.useEffect(() => {
    if (error) {
      logger.error('HomeScreen: Production orders error', error);
      console.error('🔴 Production Orders Error:', error);
    }
  }, [error]);

  // Log successful data load
  React.useEffect(() => {
    if (orders) {
      logger.info('HomeScreen: Orders loaded', { count: orders.length });
    }
  }, [orders]);

  const renderOrderItem = ({ item }: { item: ProductionOrder }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderNumber}>OF #{item.documentNumber || 'N/A'}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.productionOrderStatus)]}>
            <Text style={styles.statusText}>{getStatusText(item.productionOrderStatus)}</Text>
          </View>
        </View>
        <Text style={styles.absoluteEntry}>ID: {item.absoluteEntry}</Text>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Producto:</Text>
          <Text style={styles.orderValue}>{item.itemNo}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Cantidad:</Text>
          <Text style={styles.orderValue}>{item.plannedQuantity}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Fecha entrega:</Text>
          <Text style={styles.orderValue}>
            {new Date(item.dueDate).toLocaleDateString('es-ES')}
          </Text>
        </View>
        {item.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.orderLabel}>Observaciones:</Text>
            <Text style={styles.remarksText}>{item.remarks}</Text>
          </View>
        )}
        <View style={styles.linesInfo}>
          <Text style={styles.linesText}>
            📦 {item.productionOrderLines.length} materiales
          </Text>
        </View>
      </View>
    </Card>
  );

  const getStatusStyle = (status?: string) => {
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

  if (isLoading) {
    return <Loading />;
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
      {/* Orders List */}
      <FlatList
        data={orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.absoluteEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
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

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  orderCard: {
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
