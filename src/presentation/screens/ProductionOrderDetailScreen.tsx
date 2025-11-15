// Presentation - Production Order Detail Screen
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
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { ProductionOrder, ProductionOrderLine } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductionOrderDetail'>;

export const ProductionOrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { data: order, isLoading, error, refetch } = useProductionOrderById(id);

  React.useEffect(() => {
    if (error) {
      logger.error('ProductionOrderDetailScreen: Error fetching order', error);
      console.error('🔴 Production Order Detail Error:', error);
    }
  }, [error]);

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

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Orden</Text>
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
        <Text style={styles.headerTitle}>OF #{order.documentNumber || 'N/A'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle(order.productionOrderStatus)]}>
            <Text style={styles.statusText}>{getStatusText(order.productionOrderStatus)}</Text>
          </View>
        </View>

        {/* General Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Número Documento:</Text>
            <Text style={styles.value}>{order.documentNumber || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Producto:</Text>
            <Text style={styles.value}>{order.itemNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo Producción:</Text>
            <Text style={styles.value}>{order.productionOrderType || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origen:</Text>
            <Text style={styles.value}>{order.productionOrderOrigin || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cantidad Planificada:</Text>
            <Text style={styles.value}>{order.plannedQuantity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cantidad Completada:</Text>
            <Text style={styles.value}>{order.completedQuantity || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cantidad Rechazada:</Text>
            <Text style={styles.value}>{order.rejectedQuantity || 0}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha Inicio:</Text>
            <Text style={styles.value}>
              {new Date(order.startDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha Entrega:</Text>
            <Text style={styles.value}>
              {new Date(order.dueDate).toLocaleDateString('es-ES')}
            </Text>
          </View>
          {order.postingDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha Publicación:</Text>
              <Text style={styles.value}>
                {new Date(order.postingDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
          {order.warehouse && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Almacén:</Text>
              <Text style={styles.value}>{order.warehouse}</Text>
            </View>
          )}
          {order.customerCode && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{order.customerCode}</Text>
            </View>
          )}
          {order.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.remarksText}>{order.remarks}</Text>
            </View>
          )}
        </Card>

        {/* Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            Detalle ({order.productionOrderLines.length})
          </Text>
          {order.productionOrderLines.map((line: ProductionOrderLine, index: number) => (
            <View key={index} style={styles.lineItem}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineNumber}>Línea {line.lineNumber}</Text>
                <Text style={styles.lineType}>{line.itemType || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Producto:</Text>
                <Text style={styles.value}>{line.itemNo || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cantidad Base:</Text>
                <Text style={styles.value}>{line.baseQuantity || 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cantidad Planificada:</Text>
                <Text style={styles.value}>{line.plannedQuantity || 0}</Text>
              </View>
              {line.issuedQuantity !== undefined && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Cantidad Emitida:</Text>
                  <Text style={styles.value}>{line.issuedQuantity}</Text>
                </View>
              )}
              {line.warehouse && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Almacén:</Text>
                  <Text style={styles.value}>{line.warehouse}</Text>
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
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.fontSize.md,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  lineType: {
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
