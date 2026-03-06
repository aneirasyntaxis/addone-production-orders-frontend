// Presentation - Production Order Detail Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { SkeletonDetail } from '../components/Skeleton';
import { Button } from '../components/Button';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { ProductionOrder, ProductionOrderLine } from '../../domain/entities/production-order.entity';
import { handleError } from '../../core/errors/error-handler';
import { logger } from '../../core/logging/logger';
import { formatThousands } from '../../core/utils/number-formatter';
import { ProductionOrderAdvancesTab } from './ProductionOrderAdvancesTab';
import { ProductionOrderConsumersTab } from './ProductionOrderConsumersTab';
import { useUpdateProductionOrderQuantity } from '../hooks/useUpdateProductionOrderQuantity';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductionOrderDetail'>;

type TabType = 'info' | 'emisión' | 'recibo';

export const ProductionOrderDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const { data: order, isLoading, error, refetch } = useProductionOrderById(id);
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateProductionOrderQuantity();
  const [activeTab, setActiveTab] = React.useState<TabType>('info');
  const [isEditingQuantity, setIsEditingQuantity] = React.useState(false);
  const [editedQuantity, setEditedQuantity] = React.useState<string>('');
  const [originalQuantity, setOriginalQuantity] = React.useState<number>(0);
  const [recalculatedLines, setRecalculatedLines] = React.useState<ProductionOrderLine[]>([]);
  const [isEditingWaste, setIsEditingWaste] = React.useState(false);
  const [editedWasteValues, setEditedWasteValues] = React.useState<{[key: number]: string}>({});

  React.useEffect(() => {
    if (error) {
      logger.error('ProductionOrderDetailScreen: Error fetching order', error);
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
      case 'boposcancelled':
        return styles.statusCancelled;
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
      case 'boposcancelled':
        return 'Cancelada';
      default:
        return status || 'N/A';
    }
  };

  const getProductionTypeText = (type?: string) => {
    return type?.toLowerCase() === 'bopotstandard' ? 'Estándar' : 'Especial';
  };

  const getIssueTypeText = (type?: string) => {
    if (!type) return '';
    const lowerType = type.toLowerCase();
    if (lowerType === 'im_manual') return 'Manual';
    if (lowerType === 'im_backflush') return 'Notificación';
    return '';
  };

  const handleEditQuantity = () => {
    if (order) {
      setOriginalQuantity(order.plannedQuantity);
      setEditedQuantity(order.plannedQuantity.toString());
      setRecalculatedLines([]);
      setIsEditingQuantity(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingQuantity(false);
    setEditedQuantity('');
    setOriginalQuantity(0);
    setRecalculatedLines([]);
  };

  const handleSaveQuantity = async () => {
    const newQuantity = parseFloat(editedQuantity);
    
    if (isNaN(newQuantity) || newQuantity <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'La cantidad debe ser un número mayor a 0',
      });
      return;
    }

    if (!order?.absoluteEntry) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener el ID de la orden',
      });
      return;
    }

    // Calcular las nuevas cantidades de las líneas
    // Filtrar pit_Text - no se envían líneas de texto
    const updatedLines = order?.productionOrderLines
      .filter(line => line.itemType !== 'pit_Text')
      .map(line => {
        // Cantidad neta de la línea (sin merma) para calcular el factor
        const lineNetQuantity = line.plannedQuantity! - (line.additionalQuantity || 0);
        // Fórmula: factor = cantidad_linea_neta / cantidad_cabecera_original
        const factor = lineNetQuantity / originalQuantity;
        // nueva_cantidad_linea_neta = factor * cantidad_cabecera_nueva
        const newLineNetQuantity = factor * newQuantity;
        // plannedQuantity debe incluir la merma para el backend
        const newLineQuantity = newLineNetQuantity + (line.additionalQuantity || 0);
        
        return {
          lineNumber: line.lineNumber || 0,
          plannedQuantity: newLineQuantity,
        };
      }) || [];

    // Construir el request
    const updateRequest = {
      plannedQuantity: newQuantity,
      productionOrderLines: updatedLines,
    };

    logger.info('ProductionOrderDetailScreen: Quantity update requested', { 
      orderId: order.absoluteEntry,
      request: updateRequest,
    });

    // Llamar al servicio de actualización
    updateQuantity(
      { id: order.absoluteEntry, data: updateRequest },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Actualizado',
            text2: 'Cantidad planificada actualizada exitosamente',
          });
          setIsEditingQuantity(false);
          setRecalculatedLines([]);
          refetch(); // Recargar la OF para mostrar los cambios
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error?.message || 'No se pudo actualizar la cantidad planificada',
          });
        },
      }
    );
  };

  const handleQuantityChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    setEditedQuantity(validValue);

    // Recalcular las líneas en tiempo real para preview
    if (validValue && !isNaN(parseFloat(validValue)) && order) {
      const newQuantity = parseFloat(validValue);
      const updatedLines = order.productionOrderLines.map(line => {
        if (line.itemType === 'pit_Text' || !line.plannedQuantity) {
          return line;
        }
        
        // Cantidad neta de la línea (sin merma) para calcular el factor
        const lineNetQuantity = line.plannedQuantity! - (line.additionalQuantity || 0);
        const factor = lineNetQuantity / originalQuantity;
        const newLineNetQuantity = factor * newQuantity;
        // plannedQuantity incluye la merma para mostrar correctamente
        const newLineQuantity = newLineNetQuantity + (line.additionalQuantity || 0);
        
        return {
          ...line,
          plannedQuantity: newLineQuantity,
        };
      });
      setRecalculatedLines(updatedLines);
    } else {
      setRecalculatedLines([]);
    }
  };

  const handleEditWaste = () => {
    if (order) {
      // Inicializar valores editados con los valores actuales
      const initialValues: {[key: number]: string} = {};
      order.productionOrderLines.forEach((line, index) => {
        if (line.itemType !== 'pit_Text') {
          initialValues[index] = (line.additionalQuantity || 0).toString();
        }
      });
      setEditedWasteValues(initialValues);
      setIsEditingWaste(true);
    }
  };

  const handleCancelWasteEdit = () => {
    setIsEditingWaste(false);
    setEditedWasteValues({});
  };

  const handleWasteValueChange = (lineIndex: number, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    setEditedWasteValues({
      ...editedWasteValues,
      [lineIndex]: validValue,
    });
  };

  const handleSaveWaste = async () => {
    if (!order?.absoluteEntry) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener el ID de la orden',
      });
      return;
    }

    // Construir el request con las cantidades adicionales actualizadas
    // Solo enviamos additionalQuantity, NO plannedQuantity (nullable en backend)
    // Filtrar pit_Text - no se envían líneas de texto
    const updatedLines = order.productionOrderLines
      .map((line, originalIndex) => {
        if (line.itemType === 'pit_Text') return null;
        
        const additionalQty = editedWasteValues[originalIndex] ? parseFloat(editedWasteValues[originalIndex]) : 0;
        
        return {
          lineNumber: line.lineNumber || 0,
          additionalQuantity: additionalQty,
        };
      })
      .filter((line): line is { lineNumber: number; additionalQuantity: number } => line !== null);

    const updateRequest = {
      plannedQuantity: order.plannedQuantity,
      productionOrderLines: updatedLines,
    };

    logger.info('ProductionOrderDetailScreen: Waste update requested', { 
      orderId: order.absoluteEntry,
      request: updateRequest,
    });

    updateQuantity(
      { id: order.absoluteEntry, data: updateRequest },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Actualizado',
            text2: 'Merma actualizada exitosamente',
          });
          setIsEditingWaste(false);
          setEditedWasteValues({});
          refetch(); // Recargar la OF para mostrar los cambios
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error?.message || 'No se pudo actualizar la merma',
          });
        },
      }
    );
  };

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

      {activeTab === 'info' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, getStatusStyle(order.productionOrderStatus)]}>
              <Text style={styles.statusText}>{getStatusText(order.productionOrderStatus)}</Text>
            </View>
            {!isEditingWaste && order.productionOrderStatus?.toLowerCase() !== 'boposclosed' && order.productionOrderStatus?.toLowerCase() !== 'boposcancelled' && (
              <TouchableOpacity onPress={handleEditWaste} style={styles.editWasteButton}>
                <Text style={styles.editWasteButtonText}>Agregar Merma</Text>
              </TouchableOpacity>
            )}
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
            {order.productDescription && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Descripción:</Text>
                <Text style={styles.value}>{order.productDescription}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tipo Producción:</Text>
              <Text style={styles.value}>{getProductionTypeText(order.productionOrderType)}</Text>
            </View>
            {order.productionOrderOriginEntry && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Entrada Origen:</Text>
                <Text style={styles.value}>{order.productionOrderOriginEntry}</Text>
              </View>
            )}
            {order.productionOrderOriginNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Número Origen:</Text>
                <Text style={styles.value}>{order.productionOrderOriginNumber}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cantidad Planificada:</Text>
              {isEditingQuantity ? (
                <View style={styles.editQuantityContainer}>
                  <TextInput
                    style={styles.quantityInput}
                    value={editedQuantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="decimal-pad"
                    autoFocus
                    selectTextOnFocus
                  />
                  <TouchableOpacity onPress={handleSaveQuantity} style={styles.saveButton} disabled={isUpdating}>
                    <Text style={styles.saveIcon}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton} disabled={isUpdating}>
                    <Text style={styles.cancelIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.quantityDisplayContainer}>
                  <Text style={styles.value}>{formatThousands(order.plannedQuantity)}</Text>
                  {order.productionOrderStatus?.toLowerCase() !== 'boposclosed' && order.productionOrderStatus?.toLowerCase() !== 'boposcancelled' && (
                    <TouchableOpacity onPress={handleEditQuantity} style={styles.editButton}>
                      <Text style={styles.editIcon}>✒️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha Inicio:</Text>
              <Text style={styles.value}>
                {order.startDate ? order.startDate.split('-').reverse().join('/') : 'N/A'}
              </Text>
            </View>
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
              <View style={styles.infoRow}>
                <Text style={styles.label}>Comentarios:</Text>
                <Text style={styles.value}>{order.remarks}</Text>
              </View>
            )}
          </Card>

          {/* Details */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              Detalle ({order.productionOrderLines.length})
            </Text>
            {isEditingQuantity && recalculatedLines.length > 0 && (
              <View style={styles.recalculationNotice}>
                <Text style={styles.recalculationText}>
                  ℹ️ Las cantidades se recalcularán proporcionalmente
                </Text>
              </View>
            )}
            {(isEditingQuantity && recalculatedLines.length > 0 ? recalculatedLines : order.productionOrderLines).map((line: ProductionOrderLine, index: number) => (
              <View key={index} style={styles.lineItem}>
                <View style={styles.lineHeader}>
                  <Text style={styles.lineNumber}>Línea {index + 1}</Text>
                  <Text style={styles.lineType}>{getIssueTypeText(line.productionOrderIssueType || undefined)}</Text>
                </View>
                {line.itemType === 'pit_Text' ? (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Descripción:</Text>
                      <Text style={styles.value}>{line.lineText || 'N/A'}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Producto:</Text>
                      <Text style={styles.value}>{line.itemNo || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Q* Planificada:</Text>
                      <Text style={[
                        styles.value,
                        isEditingQuantity && recalculatedLines.length > 0 && styles.recalculatedValue
                      ]}>
                        {formatThousands(line.plannedQuantity)}
                      </Text>
                    </View>
                    {(line.additionalQuantity !== undefined && line.additionalQuantity !== null) || isEditingWaste ? (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Q* Adicional (Merma):</Text>
                        {isEditingWaste ? (
                          <TextInput
                            style={styles.wasteInput}
                            value={editedWasteValues[index] || '0'}
                            onChangeText={(value) => handleWasteValueChange(index, value)}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={theme.colors.textSecondary}
                          />
                        ) : (
                          <Text style={styles.value}>{formatThousands(line.additionalQuantity)}</Text>
                        )}
                      </View>
                    ) : null}
                    {line.warehouse && (
                      <View style={styles.infoRow}>
                        <Text style={styles.label}>Almacén:</Text>
                        <Text style={styles.value}>{line.warehouse}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}
            {isEditingWaste && (
              <View style={styles.wasteActionButtonsBottom}>
                <TouchableOpacity onPress={handleSaveWaste} style={styles.saveWasteButtonLarge} disabled={isUpdating}>
                  <Text style={styles.saveWasteButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelWasteEdit} style={styles.cancelWasteButtonLarge} disabled={isUpdating}>
                  <Text style={styles.cancelWasteButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </ScrollView>
      )}

      {activeTab === 'emisión' && (
        <ProductionOrderConsumersTab 
          productionOrderId={order.absoluteEntry || 0} 
          productionOrder={order}
        />
      )}

      {activeTab === 'recibo' && (
        <ProductionOrderAdvancesTab 
          productionOrderId={order.absoluteEntry || 0} 
          productionOrder={order}
        />
      )}

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabIcon, activeTab === 'info' && styles.tabIconActive]}>📄</Text>
          <Text style={[styles.tabLabel, activeTab === 'info' && styles.tabLabelActive]}>Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'emisión' && styles.tabButtonActive]}
          onPress={() => setActiveTab('emisión')}
        >
          <Text style={[styles.tabIcon, activeTab === 'emisión' && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'emisión' && styles.tabLabelActive]}>Emisión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'recibo' && styles.tabButtonActive]}
          onPress={() => setActiveTab('recibo')}
        >
          <Text style={[styles.tabIcon, activeTab === 'recibo' && styles.tabIconActive]}>📦</Text>
          <Text style={[styles.tabLabel, activeTab === 'recibo' && styles.tabLabelActive]}>Recibos</Text>
        </TouchableOpacity>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
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
  statusCancelled: {
    backgroundColor: theme.colors.error,
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
    marginBottom: theme.spacing.sm,
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
  placeholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontStyle: 'italic',
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 5,
    height: 60,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabIcon: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  tabIconActive: {
    color: theme.colors.primary,
  },
  tabLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
  quantityDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  editButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  editQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  quantityInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'right',
    marginRight: theme.spacing.xs,
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIcon: {
    fontSize: 18,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    fontSize: 18,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  recalculationNotice: {
    backgroundColor: '#e3f2fd',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  recalculationText: {
    fontSize: theme.fontSize.sm,
    color: '#1976d2',
    fontWeight: '500',
  },
  recalculatedValue: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  editWasteButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  editWasteButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  wasteActionButtonsBottom: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveWasteButtonLarge: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelWasteButtonLarge: {
    flex: 1,
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveWasteButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  cancelWasteButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  wasteInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 80,
  },
});
