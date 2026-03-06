// Presentation - Create Consumer Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DatePickerInput } from '../components/DatePickerInput';
import { ItemSearchInput } from '../components/ItemSearchInput';
import { useCreateConsumer } from '../hooks/useCreateConsumer';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { CreateConsumerLine, Consumer } from '../../domain/entities/consumer.entity';
import { Item } from '../../domain/entities/item.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { Batch } from '../../domain/entities/batch.entity';
import { logger } from '../../core/logging/logger';
import { useQueryClient } from '@tanstack/react-query';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateConsumer'>;

interface ConsumerLine {
  id: string;
  itemCode: string;
  itemName: string;
  itemType?: string; // Item type from Production Order (pit_Resource, pit_Item, etc.)
  quantity: string;
  warehouseCode: string;
  batchNumber: string;
  requiresBatch: boolean;
  baseEntry?: number;
  baseLine?: number;
  defaultWarehouse?: string; // Warehouse from Production Order
  availableWarehouses: Array<{ code: string; name: string; inStock: number }>;
  availableBatches: Batch[];
  loadingBatches: boolean;
}

export const CreateConsumerScreen: React.FC<Props> = ({ navigation, route }) => {
  const productionOrderId = route.params?.productionOrderId;
  const { data: productionOrder } = useProductionOrderById(productionOrderId || 0);
  const queryClient = useQueryClient();
  const [docDueDate, setDocDueDate] = useState<Date | null>(null);
  const [comments, setComments] = useState('');
  const [journalMemo, setJournalMemo] = useState('');
  const [lines, setLines] = useState<ConsumerLine[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate: createConsumer, isPending } = useCreateConsumer();

  // Initialize form with production order materials
  React.useEffect(() => {
    if (productionOrder && productionOrderId) {
      logger.debug('CreateConsumerScreen: Initializing from production order', { 
        absoluteEntry: productionOrder.absoluteEntry,
        linesCount: productionOrder.productionOrderLines.length
      });
      
      // Set dates
      if (productionOrder.dueDate) {
        // Parse date string (YYYY-MM-DD) to avoid timezone issues
        const [year, month, day] = productionOrder.dueDate.split('-').map(Number);
        setDocDueDate(new Date(year, month - 1, day)); // month is 0-indexed
      }
      
      // Set memo with production order number
      setJournalMemo(`Emisión de producción para la orden de fabricación #${productionOrder.documentNumber}`);
      
      // Set lines from production order materials (only issued materials, excluding pit_Text lines)
      const orderLines: ConsumerLine[] = productionOrder.productionOrderLines
        .filter((line) => line.itemType !== 'pit_Text') // Descartar líneas de tipo texto
        .map((line, index) => {
          const plannedQty = line.plannedQuantity || 0;
          const issuedQty = line.issuedQuantity || 0;
          const remainingQty = plannedQty - issuedQty;
          
          // Filter warehouses: show only those with stock > 0
          const availableWarehouses = (line.itemWarehouseInfoCollection || [])
            .filter(w => (w.inStock ?? 0) > 0)
            .map(w => ({
              code: w.warehouseCode || '',
              name: w.warehouseCode || '',
              inStock: w.inStock ?? 0,
            }));
          
          return {
            id: Date.now().toString() + index,
            itemCode: (line.itemNo ?? '') as string,
            itemName: (line.itemName ?? '') as string,
            itemType: line.itemType, // Item type (pit_Resource, pit_Item, etc.)
            quantity: remainingQty > 0 ? remainingQty.toString() : '',
            warehouseCode: line.warehouse || '',
            batchNumber: '',
            requiresBatch: line.manageBatchNumbers || false, // Use batch info from production order
            baseEntry: productionOrder.absoluteEntry || 0,
            baseLine: line.lineNumber,
            defaultWarehouse: line.warehouse || '', // Save default warehouse from OF
            availableWarehouses,
            availableBatches: [],
            loadingBatches: false,
            remainingQty, // Keep for filtering
          };
        })
        .filter((line) => line.remainingQty > 0) // Solo incluir líneas con cantidad pendiente
        .map(({ remainingQty, ...line }) => line); // Remover remainingQty temporal
      
      // Use batch requirements information from production order lines
      setLines(orderLines);
    }
  }, [productionOrder, productionOrderId]);

  const handleDueDateChange = (date: Date) => {
    setDocDueDate(date);
    // Clear error when date is selected
    if (errors.docDueDate) {
      setErrors({ ...errors, docDueDate: '' });
    }
  };

  const addLine = () => {
    const newLine: ConsumerLine = {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      itemType: undefined,
      quantity: '',
      warehouseCode: '',
      batchNumber: '',
      requiresBatch: false,
      defaultWarehouse: undefined,
      availableWarehouses: [],
      availableBatches: [],
      loadingBatches: false,
    };
    setLines([...lines, newLine]);
    // Clear "no materials" error when adding a line
    if (errors.lines) {
      setErrors({ ...errors, lines: '' });
    }
  };

  const updateLineItem = (id: string, item: Item) => {
    // Filter warehouses: show only those with stock > 0
    const availableWarehouses = (item.itemWarehouseInfoCollection || [])
      .filter(w => (w.inStock ?? 0) > 0)
      .map(w => ({
        code: w.warehouseCode || '',
        name: w.warehouseCode || '',
        inStock: w.inStock ?? 0,
      }));
    
    setLines(
      lines.map((line) =>
        line.id === id
          ? { 
              ...line, 
              itemCode: item.itemCode, 
              itemName: item.itemName || '',
              batchNumber: '',
              requiresBatch: item.manageBatchNumbers || false,
              warehouseCode: '',
              defaultWarehouse: undefined,
              availableWarehouses,
              availableBatches: [],
              loadingBatches: false,
            }
          : line
      )
    );
    // Clear error when item is selected
    if (errors[`line-${id}-item`]) {
      setErrors({ ...errors, [`line-${id}-item`]: '' });
    }
  };

  const clearLineItem = (id: string) => {
    setLines(
      lines.map((line) =>
        line.id === id 
          ? { 
              ...line, 
              itemCode: '', 
              itemName: '',
              batchNumber: '',
              requiresBatch: false,
              warehouseCode: '',
              defaultWarehouse: undefined,
              availableWarehouses: [],
              availableBatches: [],
              loadingBatches: false,
            } 
          : line
      )
    );
  };

  const updateLineWarehouse = (id: string, warehouseCode: string) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          // Reset batch when warehouse changes
          return {
            ...line,
            warehouseCode,
            batchNumber: '',
            availableBatches: [],
            loadingBatches: false,
          };
        }
        return line;
      })
    );
    // Clear warehouse and batch errors when warehouse selected
    const newErrors = { ...errors };
    delete newErrors[`line-${id}-warehouse`];
    delete newErrors[`line-${id}-batchNumber`];
    setErrors(newErrors);
  };

  const updateLineBatchNumber = (id: string, batchNumber: string) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, batchNumber } : line))
    );
    // Clear batch error when selected
    if (errors[`line-${id}-batchNumber`] && batchNumber) {
      setErrors({ ...errors, [`line-${id}-batchNumber`]: '' });
    }
  };

  // Load batches dynamically when item and warehouse are selected
  React.useEffect(() => {
    lines.forEach(async (line) => {
      if (line.requiresBatch && line.itemCode && line.warehouseCode && line.availableBatches.length === 0 && !line.loadingBatches) {
        // Mark as loading
        setLines(prevLines =>
          prevLines.map(l => l.id === line.id ? { ...l, loadingBatches: true } : l)
        );

        try {
          const { batchRepository } = await import('../../data/repositories/batch.repository.impl');
          const batches = await batchRepository.getBatchesByItemAndWarehouse(line.itemCode, line.warehouseCode);
          
          setLines(prevLines =>
            prevLines.map(l => 
              l.id === line.id 
                ? { ...l, availableBatches: batches, loadingBatches: false }
                : l
            )
          );
        } catch (error) {
          logger.error('Error loading batches', { error, lineId: line.id });
          setLines(prevLines =>
            prevLines.map(l => l.id === line.id ? { ...l, loadingBatches: false } : l)
          );
        }
      }
    });
  }, [lines.map(l => `${l.id}-${l.itemCode}-${l.warehouseCode}-${l.requiresBatch}`).join('|')]);

  const removeLine = (id: string) => {
    // No permitir eliminar si solo queda una línea
    if (lines.length <= 1) {
      Toast.show({
        type: 'error',
        text1: 'No se puede eliminar',
        text2: 'Debe mantener al menos una línea de material',
      });
      return;
    }
    setLines(lines.filter((line) => line.id !== id));
  };

  const updateLineQuantity = (id: string, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    let validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    // Remove leading zeros except for decimals (0.5 is valid, but 007 becomes 7)
    if (validValue && !validValue.startsWith('0.')) {
      validValue = validValue.replace(/^0+/, '') || '0';
    }
    
    setLines(
      lines.map((line) => (line.id === id ? { ...line, quantity: validValue } : line))
    );
    // Clear quantity error when valid value is entered
    if (errors[`line-${id}-quantity`] && validValue && parseFloat(validValue) > 0) {
      setErrors({ ...errors, [`line-${id}-quantity`]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!docDueDate) {
      newErrors.docDueDate = 'Seleccione la fecha de entrega';
    }

    if (lines.length === 0) {
      newErrors.lines = 'Debe agregar al menos un material';
    } else {
      // Validar que al menos una línea tenga cantidad mayor a 0
      const hasValidQuantity = lines.some((line) => line.quantity && parseFloat(line.quantity) > 0);
      if (!hasValidQuantity) {
        newErrors.lines = 'Debe ingresar al menos una cantidad mayor a 0';
      }
    }

    lines.forEach((line) => {
      if (!line.itemCode) {
        newErrors[`line-${line.id}-item`] = 'Seleccione un producto';
      }
      // Skip warehouse validation for pit_Resource items (non-inventoriable)
      if (line.itemType !== 'pit_Resource') {
        if (!line.warehouseCode) {
          newErrors[`line-${line.id}-warehouse`] = 'Seleccione un almacén';
        }
        // Validar que el almacén tenga stock > 0 (only for inventoriable items)
        if (line.warehouseCode) {
          const selectedWarehouse = line.availableWarehouses.find(w => w.code === line.warehouseCode);
          if (selectedWarehouse && selectedWarehouse.inStock === 0) {
            newErrors[`line-${line.id}-warehouse`] = 'El almacén seleccionado no tiene stock disponible';
          }
        }
      }
      if (line.quantity && parseFloat(line.quantity) < 0) {
        newErrors[`line-${line.id}-quantity`] = 'La cantidad no puede ser negativa';
      }
      if (line.requiresBatch && !line.batchNumber) {
        newErrors[`line-${line.id}-batchNumber`] = 'Debe seleccionar un lote';
      }
      // Validar que el lote tenga cantidad suficiente
      if (line.requiresBatch && line.batchNumber && line.quantity) {
        const selectedBatch = line.availableBatches.find(b => b.batchNum === line.batchNumber);
        if (selectedBatch && parseFloat(line.quantity) > selectedBatch.quantity) {
          newErrors[`line-${line.id}-batchNumber`] = `El lote no tiene cantidad suficiente (Disponible: ${selectedBatch.quantity})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if any line has insufficient batch quantity (blocks submission)
  const hasInsufficientBatchQuantity = React.useMemo(() => {
    return lines.some(line => {
      if (!line.requiresBatch || !line.batchNumber || !line.quantity) return false;
      const selectedBatch = line.availableBatches.find(b => b.batchNum === line.batchNumber);
      return selectedBatch && parseFloat(line.quantity) > selectedBatch.quantity;
    });
  }, [lines]);

  const handleSubmit = () => {
    logger.info('CreateConsumerScreen: Submit pressed');

    // Check for insufficient batch quantities
    if (hasInsufficientBatchQuantity) {
      Toast.show({
        type: 'error',
        text1: 'Error de Lote',
        text2: 'Uno o más lotes no tienen cantidad suficiente',
      });
      return;
    }

    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Error de Validación',
        text2: 'Por favor corrija los errores en el formulario',
      });
      return;
    }

    const consumerLines: CreateConsumerLine[] = lines
      .filter((line) => line.quantity && parseFloat(line.quantity) > 0)
      .map((line) => ({
        quantity: parseFloat(line.quantity),
        warehouseCode: line.warehouseCode,
        baseEntry: line.baseEntry ?? null,
        baseLine: line.baseLine,
        baseType: 202, // Production Order type
        batchNumbers: line.requiresBatch ? [{
          batchNumber: line.batchNumber,
          quantity: parseFloat(line.quantity),
        }] : undefined,
      }));

    const formatDateForApi = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const consumer = {
      docDueDate: formatDateForApi(docDueDate!),
      comments: comments || '',
      journalMemo: journalMemo || '',
      documentLines: consumerLines,
    };

    logger.debug('CreateConsumerScreen: Creating consumer', { consumer });

    createConsumer(consumer, {
      onSuccess: (data: Consumer) => {
        // Invalidar cache de la orden de producción para que se recargue con datos actualizados
        if (productionOrderId) {
          queryClient.invalidateQueries({ queryKey: ['production-order', productionOrderId] });
        }
        
        // Invalidar cache de la lista de órdenes de producción para reflejar cambios de estado
        queryClient.invalidateQueries({ queryKey: ['production-orders'] });
        
        Toast.show({
          type: 'success',
          text1: 'Emisión para producción Creada',
          text2: `Emisión para producción #${data.docNum || data.docEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear la emisión para producción',
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Emisión para producción</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Información General</Text>

          <DatePickerInput
            label="Fecha de Contabilización"
            value={docDueDate}
            onChange={handleDueDateChange}
            error={errors.docDueDate}
          />
        </Card>

        {/* Materials Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Materiales</Text>

          {errors.lines && (
            <Text style={styles.errorText}>{errors.lines}</Text>
          )}

          {lines.length === 0 ? (
            <View style={styles.emptyLines}>
              <Text style={styles.emptyLinesText}>
                No hay materiales agregados. Presione "Agregar" para comenzar.
              </Text>
            </View>
          ) : null}

          {lines.map((line, index) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineTitle}>Linea {index + 1}</Text>
                <TouchableOpacity onPress={() => removeLine(line.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Producto</Text>
                {productionOrderId ? (
                  <>
                    <TextInput
                      style={[styles.input, styles.inputDisabled]}
                      value={line.itemCode}
                      editable={false}
                      placeholder="Código del producto"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </>
                ) : (
                  <>
                    <ItemSearchInput
                      value={line.itemCode}
                      onSelectItem={(item) => updateLineItem(line.id, item)}
                      onClear={() => clearLineItem(line.id)}
                      placeholder="Buscar producto..."
                    />
                    {errors[`line-${line.id}-item`] && (
                      <Text style={styles.errorText}>{errors[`line-${line.id}-item`]}</Text>
                    )}
                  </>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={line.itemName}
                  editable={false}
                  placeholder="Nombre del producto"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Only show warehouse selector for inventoriable items (not pit_Resource) */}
              {line.itemType !== 'pit_Resource' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Almacén *</Text>
                  <View style={[
                    styles.pickerContainer,
                    errors[`line-${line.id}-warehouse`] && styles.inputError,
                  ]}>
                    <Picker
                      selectedValue={line.warehouseCode}
                      onValueChange={(value) => updateLineWarehouse(line.id, value)}
                      enabled={line.availableWarehouses.length > 0}
                      style={styles.picker}
                    >
                      <Picker.Item 
                        label="Seleccione almacén" 
                        value="" 
                        color={theme.colors.textSecondary}
                      />
                      {/* Show default warehouse from OF (even if stock 0) */}
                      {line.defaultWarehouse && (() => {
                        const defaultWh = line.availableWarehouses.find(w => w.code === line.defaultWarehouse);
                        if (!defaultWh) {
                          // Default warehouse not in filtered list (stock 0), add it with warning
                          return (
                            <Picker.Item
                              key={line.defaultWarehouse}
                              label={`${line.defaultWarehouse} (Stock: 0 - SIN STOCK)`}
                              value={line.defaultWarehouse}
                              color={theme.colors.error}
                            />
                          );
                        }
                        return null;
                      })()}
                      {/* Show warehouses with stock > 0 */}
                      {line.availableWarehouses.map((warehouse) => (
                        <Picker.Item
                          key={warehouse.code}
                          label={`${warehouse.name} (Stock: ${warehouse.inStock})`}
                          value={warehouse.code}
                        />
                      ))}
                    </Picker>
                  </View>
                  {errors[`line-${line.id}-warehouse`] && (
                    <Text style={styles.errorText}>{errors[`line-${line.id}-warehouse`]}</Text>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`line-${line.id}-quantity`] && styles.inputError,
                  ]}
                  value={line.quantity}
                  onChangeText={(value) => updateLineQuantity(line.id, value)}
                  placeholder="Ej: 10"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
                {errors[`line-${line.id}-quantity`] && (
                  <Text style={styles.errorText}>{errors[`line-${line.id}-quantity`]}</Text>
                )}
              </View>

              {line.requiresBatch && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Lote *</Text>
                  {!line.itemCode || !line.warehouseCode ? (
                    <View style={styles.disabledPickerContainer}>
                      <Text style={styles.disabledPickerText}>
                        Seleccione primero el producto y el almacén
                      </Text>
                    </View>
                  ) : line.loadingBatches ? (
                    <View style={styles.loadingPickerContainer}>
                      <Text style={styles.loadingPickerText}>Cargando lotes...</Text>
                    </View>
                  ) : line.availableBatches.length === 0 ? (
                    <View style={styles.noDataPickerContainer}>
                      <Text style={styles.noDataPickerText}>
                        No hay lotes disponibles para este producto y almacén
                      </Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.pickerContainer,
                      errors[`line-${line.id}-batchNumber`] && styles.inputError,
                    ]}>
                      <Picker
                        selectedValue={line.batchNumber}
                        onValueChange={(value) => updateLineBatchNumber(line.id, value)}
                        enabled={line.availableBatches.length > 0}
                        style={styles.picker}
                      >
                        <Picker.Item 
                          label="Seleccione lote" 
                          value="" 
                          color={theme.colors.textSecondary}
                        />
                        {line.availableBatches.map((batch) => {
                          const isInsufficient = line.quantity && parseFloat(line.quantity) > batch.quantity;
                          return (
                            <Picker.Item
                              key={batch.batchNum}
                              label={`${batch.batchNum} (Disponible: ${batch.quantity}${isInsufficient ? ' - INSUFICIENTE' : ''})`}
                              value={batch.batchNum}
                              color={isInsufficient ? theme.colors.error : theme.colors.text}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                  )}
                  {errors[`line-${line.id}-batchNumber`] && (
                    <Text style={styles.errorText}>{errors[`line-${line.id}-batchNumber`]}</Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Submit Button */}
        {hasInsufficientBatchQuantity && (
          <Card style={[styles.card, styles.warningCard]}>
            <Text style={styles.warningText}>
              ⚠️ No se puede crear la emisión: Uno o más lotes no tienen cantidad suficiente
            </Text>
          </Card>
        )}
        <Button
          title={isPending ? 'Creando...' : 'Crear Emisión para producción'}
          onPress={handleSubmit}
          disabled={isPending || hasInsufficientBatchQuantity}
          style={styles.submitButton}
        />
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputDisabled: {
    backgroundColor: theme.colors.border,
    color: theme.colors.textSecondary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  lineCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  lineTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  removeButton: {
    fontSize: 20,
    color: theme.colors.error,
    fontWeight: 'bold',
    padding: theme.spacing.xs,
  },
  emptyLines: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLinesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  addButtonBottom: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonBottomText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  charCounter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
  pickerContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 50,
    color: theme.colors.text,
  },
  disabledPickerContainer: {
    backgroundColor: theme.colors.border,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  disabledPickerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingPickerContainer: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  loadingPickerText: {
    fontSize: theme.fontSize.sm,
    color: '#1976D2',
    textAlign: 'center',
  },
  noDataPickerContainer: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFE69C',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  noDataPickerText: {
    fontSize: theme.fontSize.sm,
    color: '#856404',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  warningText: {
    fontSize: theme.fontSize.md,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
  },
});
