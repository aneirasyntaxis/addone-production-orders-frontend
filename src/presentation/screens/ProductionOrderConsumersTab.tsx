// Presentation - Production Order Consumers Tab Component
import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { FAB } from '../components/FAB';
import { useConsumersByProductionOrder } from '../hooks/useConsumersByProductionOrder';
import { Consumer } from '../../domain/entities/consumer.entity';
import { ProductionOrder } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

interface ProductionOrderConsumersTabProps {
  productionOrderId: number;
  productionOrder?: ProductionOrder;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductionOrderConsumersTab: React.FC<ProductionOrderConsumersTabProps> = ({
  productionOrderId,
  productionOrder,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const {
    data: consumers,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useConsumersByProductionOrder(productionOrderId);

  React.useEffect(() => {
    if (error) {
      logger.error('ProductionOrderConsumersTab: Error fetching consumers', error);
    }
  }, [error]);

  React.useEffect(() => {
    if (consumers) {
      logger.info('ProductionOrderConsumersTab: Consumers loaded', {
        count: consumers.length,
        productionOrderId,
      });
    }
  }, [consumers, productionOrderId]);

  const handleCreateConsumer = () => {
    logger.info('Create consumer button pressed', { productionOrderId });
    navigation.navigate('CreateConsumer', { productionOrderId });
  };

  // Verificar si hay líneas pendientes de consumir (excluyendo pit_Text)
  const hasRemainingLines = React.useMemo(() => {
    if (!productionOrder) return true; // Si no hay orden, mostrar botón por defecto
    
    return productionOrder.productionOrderLines.some((line) => {
      // Excluir líneas de tipo texto
      if (line.itemType === 'pit_Text') return false;
      
      const plannedQty = line.plannedQuantity || 0;
      const issuedQty = line.issuedQuantity || 0;
      const remainingQty = plannedQty - issuedQty;
      
      return remainingQty > 0;
    });
  }, [productionOrder]);

  const renderConsumerItem = ({ item }: { item: Consumer }) => (
    <Card style={styles.consumerCard}>
      <View style={styles.consumerHeader}>
        <View style={styles.consumerHeaderLeft}>
          <Text style={styles.consumerNumber}>Emisión #{item.docNum || item.docEntry}</Text>
          <Text style={styles.docEntry}>Emisión para producción</Text>
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
        <View style={styles.linesInfo}>
          <Text style={styles.linesText}>📋 {item.documentLines.length} líneas</Text>
        </View>
        {item.documentLines.map((line, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Línea {line.lineNumber || line.baseLine}:</Text>
              <Text style={styles.lineValue}>{line.itemCode || 'N/A'}</Text>
            </View>
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Cantidad:</Text>
              <Text style={styles.lineValue}>{line.quantity}</Text>
            </View>
            {line.warehouseCode && (
              <View style={styles.lineRow}>
                <Text style={styles.lineLabel}>Almacén:</Text>
                <Text style={styles.lineValue}>{line.warehouseCode}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando consumos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error al cargar consumos</Text>
        <Text style={styles.errorText}>{handleError(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={consumers || []}
        renderItem={renderConsumerItem}
        keyExtractor={(item) => item.docEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No hay emisiones registradas</Text>
            <Text style={styles.emptySubtext}>
              Las emisiones de producción de esta orden de fabricación aparecerán aquí
            </Text>
          </View>
        }
      />
      {hasRemainingLines && <FAB onPress={handleCreateConsumer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  consumerCard: {
    marginBottom: theme.spacing.md,
  },
  consumerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.xs,
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
    marginBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  linesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  lineItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs / 2,
  },
  lineLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  lineValue: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
