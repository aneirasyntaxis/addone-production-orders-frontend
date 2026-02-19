// Presentation - Create Production Receipt Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DatePickerInput } from '../components/DatePickerInput';
import { WarehouseSearchInput } from '../components/WarehouseSearchInput';
import { useCreateAdvancedProduct } from '../hooks/useCreateAdvancedProduct';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { useItemByCode } from '../hooks/useItemByCode';
import { useAdvancedProductsByProductionOrder } from '../hooks/useAdvancedProductsByProductionOrder';
import { CreateAdvancedProductLine } from '../../domain/entities/advanced-product.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProductionReceipt'>;

interface ProductionReceiptLine {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  warehouseCode: string;
  batchNumber: string;
  baseEntry: number | null;
}

export const CreateProductionReceiptScreen: React.FC<Props> = ({ navigation, route }) => {
  const productionOrderId = route.params.productionOrderId;
  const { data: productionOrder } = useProductionOrderById(productionOrderId);
  const { data: existingReceipts } = useAdvancedProductsByProductionOrder(productionOrderId);
  const [docDueDate, setDocDueDate] = useState<Date | null>(null);
  const [comments, setComments] = useState('');
  const [journalMemo, setJournalMemo] = useState('');
  const [line, setLine] = useState<ProductionReceiptLine>({
    id: Date.now().toString(),
    itemCode: '',
    itemName: '',
    quantity: '',
    warehouseCode: '',
    batchNumber: '',
    baseEntry: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch item details to check if batch management is required
  const { data: itemData, isLoading: isLoadingItem } = useItemByCode(line.itemCode || null);
  const requiresBatch = itemData?.manageBatchNumbers || false;

  // Calculate available quantity
  const plannedQuantity = productionOrder?.plannedQuantity || 0;
  const receivedQuantity = existingReceipts?.reduce((sum, receipt) => {
    // Sum quantities from all receipt lines
    const receiptTotal = receipt.documentLines.reduce((lineSum, line) => lineSum + line.quantity, 0);
    return sum + receiptTotal;
  }, 0) || 0;
  const availableQuantity = plannedQuantity - receivedQuantity;

  // Initialize form with production order data
  React.useEffect(() => {
    if (productionOrder) {
      logger.debug('CreateProductionReceiptScreen: Initializing from production order', { 
        absoluteEntry: productionOrder.absoluteEntry,
        itemNo: productionOrder.itemNo
      });
      
      // Set dates
      if (productionOrder.dueDate) {
        // Parse date string (YYYY-MM-DD) to avoid timezone issues
        const [year, month, day] = productionOrder.dueDate.split('-').map(Number);
        setDocDueDate(new Date(year, month - 1, day)); // month is 0-indexed
      }
      
      // Set memo with production order number
      setJournalMemo(`Recibo de producción para la orden de fabricación #${productionOrder.documentNumber}`);
      
      // Set line for finished product
      setLine({
        id: Date.now().toString(),
        itemCode: productionOrder.itemNo || '',
        itemName: productionOrder.itemNo || '',
        quantity: '',
        warehouseCode: '',
        batchNumber: '',
        baseEntry: productionOrder.absoluteEntry || null,
      });
    }
  }, [productionOrder]);

  const { mutate: createProductionReceipt, isPending } = useCreateAdvancedProduct();

  const handleDueDateChange = (date: Date) => {
    setDocDueDate(date);
    // Clear error when date is selected
    if (errors.docDueDate) {
      setErrors({ ...errors, docDueDate: '' });
    }
  };

  const updateWarehouse = (warehouse: Warehouse) => {
    setLine({ ...line, warehouseCode: warehouse.warehouseCode });
    // Clear warehouse error when selected
    if (errors.warehouse) {
      setErrors({ ...errors, warehouse: '' });
    }
  };

  const clearWarehouse = () => {
    setLine({ ...line, warehouseCode: '' });
  };

  const updateQuantity = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    let validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    // Remove leading zeros except for decimals (0.5 is valid, but 007 becomes 7)
    if (validValue && !validValue.startsWith('0.')) {
      validValue = validValue.replace(/^0+/, '') || '0';
    }
    
    // Validate against available quantity
    if (validValue && parseFloat(validValue) > availableQuantity) {
      setErrors({ ...errors, quantity: `Cantidad máxima disponible: ${availableQuantity}` });
      return;
    }
    
    setLine({ ...line, quantity: validValue });
    // Clear quantity error when valid value is entered
    if (errors.quantity && validValue && parseFloat(validValue) > 0) {
      setErrors({ ...errors, quantity: '' });
    }
  };

  const updateBatchNumber = (value: string) => {
    // Limit to 40 characters
    const limitedValue = value.slice(0, 40);
    setLine({ ...line, batchNumber: limitedValue });
    // Clear batch error when value is entered
    if (errors.batchNumber && limitedValue) {
      setErrors({ ...errors, batchNumber: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!docDueDate) {
      newErrors.docDueDate = 'Seleccione la fecha de contabilización';
    }

    if (!line.warehouseCode) {
      newErrors.warehouse = 'Seleccione un almacén';
    }

    if (!line.quantity || parseFloat(line.quantity) <= 0) {
      newErrors.quantity = 'Cantidad inválida';
    } else if (parseFloat(line.quantity) > availableQuantity) {
      newErrors.quantity = `La cantidad no puede exceder ${availableQuantity}`;
    }

    if (requiresBatch && !line.batchNumber) {
      newErrors.batchNumber = 'El lote es obligatorio para este producto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    logger.info('CreateProductionReceiptScreen: Submit pressed');

    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Error de Validación',
        text2: 'Por favor corrija los errores en el formulario',
      });
      return;
    }

    const productLines: CreateAdvancedProductLine[] = [{
      quantity: parseFloat(line.quantity),
      baseEntry: line.baseEntry,
      batchNumbers: requiresBatch ? [{
        batchNumber: line.batchNumber,
        quantity: parseFloat(line.quantity),
      }] : [],
    }];

    const formatDateForApi = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const product = {
      docDueDate: formatDateForApi(docDueDate!),
      comments: comments || '',
      journalMemo: journalMemo || '',
      documentLines: productLines,
    };

    logger.debug('CreateProductionReceiptScreen: Creating production receipt', { product });

    createProductionReceipt(product, {
      onSuccess: (data) => {
        Toast.show({
          type: 'success',
          text1: 'Recibo Creado',
          text2: `Recibo de producción #${data.docNum || data.docEntry} creado exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear el recibo de producción',
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
        <Text style={styles.headerTitle}>Recibo de Producción</Text>
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

        {/* Product Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Producto Terminado</Text>

          <View style={styles.lineCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Producto</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={line.itemCode}
                editable={false}
                placeholder="Código del producto"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <WarehouseSearchInput
              label="Almacén *"
              value={line.warehouseCode}
              onSelectWarehouse={updateWarehouse}
              onClear={clearWarehouse}
              placeholder="Buscar almacén..."
              error={errors.warehouse}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad (Máx: {availableQuantity})</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.quantity && styles.inputError,
                ]}
                value={line.quantity}
                onChangeText={updateQuantity}
                placeholder="Ej: 10"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
              {errors.quantity && (
                <Text style={styles.errorText}>{errors.quantity}</Text>
              )}
            </View>

            {requiresBatch && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lote *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.batchNumber && styles.inputError,
                  ]}
                  value={line.batchNumber}
                  onChangeText={updateBatchNumber}
                  placeholder="Ej: LOTE-2024-001"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={40}
                />
                {errors.batchNumber && (
                  <Text style={styles.errorText}>{errors.batchNumber}</Text>
                )}
                <Text style={styles.charCounter}>{line.batchNumber.length}/40 caracteres</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Submit Button */}
        {isLoadingItem ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando información del producto...</Text>
          </View>
        ) : (
          <Button
            title={isPending ? 'Creando...' : 'Crear Recibo de Producción'}
            onPress={handleSubmit}
            disabled={isPending}
            style={styles.submitButton}
          />
        )}
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
  charCounter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
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
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  lineCard: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  loadingText: {
    marginLeft: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
