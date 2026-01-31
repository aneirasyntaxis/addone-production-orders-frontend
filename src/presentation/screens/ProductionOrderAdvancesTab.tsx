// Presentation - Production Order Advances Tab Component
import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { FAB } from '../components/FAB';
import { useAdvancedProductsByProductionOrder } from '../hooks/useAdvancedProductsByProductionOrder';
import { AdvancedProduct } from '../../domain/entities/advanced-product.entity';
import { ProductionOrder } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

interface ProductionOrderAdvancesTabProps {
  productionOrderId: number;
  productionOrder?: ProductionOrder;
}

export const ProductionOrderAdvancesTab: React.FC<ProductionOrderAdvancesTabProps> = ({
  productionOrderId,
  productionOrder,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    data: advances,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdvancedProductsByProductionOrder(productionOrderId);

  React.useEffect(() => {
    if (error) {
      logger.error('ProductionOrderAdvancesTab: Error fetching advances', error);
      console.error('🔴 Production Order Advances Error:', error);
    }
  }, [error]);

  React.useEffect(() => {
    if (advances) {
      logger.info('ProductionOrderAdvancesTab: Advances loaded', {
        count: advances.length,
        productionOrderId,
      });
    }
  }, [advances, productionOrderId]);

  // Verificar si aún hay cantidad disponible para recibir
  const hasAvailableQuantity = React.useMemo(() => {
    if (!productionOrder) return true; // Si no hay orden, mostrar botón por defecto
    
    const plannedQuantity = productionOrder.plannedQuantity || 0;
    const receivedQuantity = advances?.reduce((sum, receipt) => {
      // Sum quantities from all receipt lines
      const receiptTotal = receipt.documentLines.reduce((lineSum, line) => lineSum + line.quantity, 0);
      return sum + receiptTotal;
    }, 0) || 0;
    
    return receivedQuantity < plannedQuantity;
  }, [productionOrder, advances]);

  const handleCreateAdvance = () => {
    logger.info('Create advance button pressed', { productionOrderId });
    navigation.navigate('CreateProductionReceipt', { productionOrderId });
  };

  const renderAdvanceItem = ({ item }: { item: AdvancedProduct }) => (
    <Card style={styles.advanceCard}>
      <View style={styles.advanceHeader}>
        <View style={styles.advanceHeaderLeft}>
          <Text style={styles.advanceNumber}>Recibo #{item.docNum || item.docEntry}</Text>
          <Text style={styles.docEntry}>Recibo de producción</Text>
        </View>
      </View>

      <View style={styles.advanceContent}>
        {item.journalMemo && (
          <View style={styles.advanceRow}>
            <Text style={styles.advanceLabel}>Memo:</Text>
            <Text style={styles.advanceValue}>{item.journalMemo}</Text>
          </View>
        )}
        {item.comments && (
          <View style={styles.advanceRow}>
            <Text style={styles.advanceLabel}>Comentarios:</Text>
            <Text style={styles.advanceValue}>{item.comments}</Text>
          </View>
        )}
        {item.docDueDate && (
          <View style={styles.advanceRow}>
            <Text style={styles.advanceLabel}>Fecha:</Text>
            <Text style={styles.advanceValue}>
              {new Date(item.docDueDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
        )}
        <View style={styles.linesInfo}>
          <Text style={styles.linesText}>📦 {item.documentLines.length} líneas</Text>
        </View>
        {item.documentLines.map((line, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Línea {line.lineNum}:</Text>
              <Text style={styles.lineValue}>{line.itemCode}</Text>
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
        <Text style={styles.loadingText}>Cargando avances...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error al cargar recibos de producción</Text>
        <Text style={styles.errorText}>{handleError(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={advances || []}
        renderItem={renderAdvanceItem}
        keyExtractor={(item) => item.docEntry?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay registros de recibo de producción registrados</Text>
            <Text style={styles.emptySubtext}>
              Los registros de recibo de producción de esta orden de fabricación aparecerán aquí
            </Text>
          </View>
        }
      />
      {hasAvailableQuantity && <FAB onPress={handleCreateAdvance} />}
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
  advanceCard: {
    marginBottom: theme.spacing.md,
  },
  advanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  advanceHeaderLeft: {
    flex: 1,
  },
  advanceNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  docEntry: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  advanceContent: {
    gap: theme.spacing.sm,
  },
  advanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  advanceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  advanceValue: {
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
    borderLeftColor: theme.colors.primary,
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
