// Presentation - Create Advanced Product Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useCreateAdvancedProduct } from '../hooks/useCreateAdvancedProduct';
import { useConsumerById } from '../hooks/useConsumerById';
import { useProfitCenters } from '../hooks/useProfitCenters';
import { useAdvancedProductsByConsumer } from '../hooks/useAdvancedProductsByConsumer';
import { Item } from '../../domain/entities/item.entity';
import { CreateAdvancedProductLine } from '../../domain/entities/advanced-product.entity';
import { BatchNumbers } from '../../domain/entities/batch-numbers.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAdvancedProduct'>;

interface AdvancedProductLine {
  id: string;
  itemCode: string;
  itemName: string;
  projectCode: string;
  costingCode: string;
  costingCodeName: string;
  quantity: string;
  warehouseCode: string;
  batchNumber: string;
  requiresBatch: boolean;
  availableWarehouses: Array<{ code: string; name: string; inStock: number }>;
  maxQuantity?: number;
  baseEntry: number | null;
  baseLine?: number;
  baseType?: number | null;
  price?: number;
  batchNumbers?: BatchNumbers[];
}

export const CreateAdvancedProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const consumerId = route.params.consumerId;
  const { data: sourceConsumer } = useConsumerById(consumerId);
  const { data: existingEntries } = useAdvancedProductsByConsumer(consumerId);
  const [docDueDate, setDocDueDate] = useState<Date | null>(null);
  const [comments, setComments] = useState('');
  const [journalMemo, setJournalMemo] = useState('');
  const [lines, setLines] = useState<AdvancedProductLine[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } = useProfitCenters();

  // Initialize form with consumer data
  React.useEffect(() => {
    if (sourceConsumer) {
      logger.debug('CreateAdvancedProductScreen: Initializing from consumer', { 
        docDueDate: sourceConsumer.docDueDate,
        docDate: sourceConsumer.docDate,
        comments: sourceConsumer.comments,
        journalMemo: sourceConsumer.journalMemo,
        linesCount: sourceConsumer.documentLines.length,
        existingEntriesCount: existingEntries?.length || 0
      });
      
      // Set dates - try docDueDate first, then docDate as fallback
      const dateToUse = sourceConsumer.docDueDate || sourceConsumer.docDate;
      if (dateToUse) {
        // Parse date string (YYYY-MM-DD) to avoid timezone issues
        const [year, month, day] = dateToUse.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
        logger.debug('CreateAdvancedProductScreen: Setting date', { dateToUse, parsedDate });
        setDocDueDate(parsedDate);
      }
      // Set comments and memo
      setComments(sourceConsumer.comments || '');
      setJournalMemo(`Entrada generada con la salida #${sourceConsumer.docNum}`);
      
      // Calculate consumed quantities per line
      const consumedQuantities: { [lineNumber: number]: number } = {};
      if (existingEntries && existingEntries.length > 0) {
        logger.debug('CreateAdvancedProductScreen: Processing existing entries', {
          entriesCount: existingEntries.length,
          entries: existingEntries.map(e => ({
            docEntry: e.docEntry,
            docNum: e.docNum,
            linesCount: e.documentLines?.length || 0
          }))
        });
        
        existingEntries.forEach(entry => {
          entry.documentLines?.forEach(line => {
            if (line.baseLine !== undefined) {
              logger.debug('CreateAdvancedProductScreen: Adding consumed quantity', {
                baseLine: line.baseLine,
                quantity: line.quantity,
                previousConsumed: consumedQuantities[line.baseLine] || 0
              });
              consumedQuantities[line.baseLine] = (consumedQuantities[line.baseLine] || 0) + line.quantity;
            }
          });
        });
        
        logger.debug('CreateAdvancedProductScreen: Total consumed quantities', { consumedQuantities });
      } else {
        logger.debug('CreateAdvancedProductScreen: No existing entries found');
      }
      
      // Filter out fully consumed lines and calculate available quantities
      const availableLines = sourceConsumer.documentLines.filter(line => {
        if (line.lineNumber === undefined) return false;
        const consumed = consumedQuantities[line.lineNumber] || 0;
        return consumed < line.quantity; // Only include lines with remaining quantity
      });
      
      const consumerLines: AdvancedProductLine[] = availableLines.map((line, index) => {
        // Get costing code name from profit centers
        const costingCodeName = line.costingCode 
          ? profitCenters.find(pc => pc.centerCode === line.costingCode)?.centerName || line.costingCode
          : '';
        
        // Extract batch number from batchNumbers array
        const extractedBatchNumber = (line.batchNumbers && line.batchNumbers.length > 0)
          ? line.batchNumbers[0].batchNumber || ''
          : '';
        
        // Determine if requires batch based on batchNumbers presence
        const requiresBatch = !!(line.batchNumbers && line.batchNumbers.length > 0);

        return {
          id: Date.now().toString() + index,
          itemCode: line.itemCode || '',
          itemName: line.itemDescription || '',
          projectCode: line.projectCode || '',
          costingCode: line.costingCode || '',
          costingCodeName,
          quantity: line.lineNumber !== undefined ? (line.quantity - (consumedQuantities[line.lineNumber] || 0)).toString() : line.quantity.toString(),
          warehouseCode: line.warehouseCode || '',
          batchNumber: extractedBatchNumber,
          requiresBatch,
          availableWarehouses: [],
          maxQuantity: line.lineNumber !== undefined ? (line.quantity - (consumedQuantities[line.lineNumber] || 0)) : line.quantity,
          baseEntry: sourceConsumer.docEntry || null,
          baseLine: line.lineNumber,
          baseType: 60,
          price: line.price,
          batchNumbers: line.batchNumbers,
        };
      });
      
      setLines(consumerLines);
    }
  }, [sourceConsumer, existingEntries, profitCenters]);

  const { mutate: createAdvancedProduct, isPending } = useCreateAdvancedProduct({ consumerId });

  const addLine = () => {
    const newLine: AdvancedProductLine = {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      projectCode: '',
      costingCode: '',
      costingCodeName: '',
      quantity: '',
      warehouseCode: '',
      batchNumber: '',
      requiresBatch: false,
      availableWarehouses: [],
      maxQuantity: undefined,
      baseEntry: null,
      baseLine: undefined,
      baseType: null,
      price: undefined,
      batchNumbers: undefined,
    };
    setLines([...lines, newLine]);
    // Clear "no materials" error when adding a line
    if (errors.lines) {
      setErrors({ ...errors, lines: '' });
    }
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((line) => line.id !== id));
  };

  const updateLineItem = (id: string, item: Item) => {
    // Get all warehouses (no filter needed for entries)
    const availableWarehouses = item.itemWarehouseInfoCollection
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
              warehouseCode: '', // Reset warehouse selection
              batchNumber: '',
              requiresBatch: item.manageBatchNumbers || false,
              availableWarehouses,
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
              projectCode: '',
              costingCode: '',
              costingCodeName: '',
              warehouseCode: '',
              batchNumber: '',
              requiresBatch: false,
              availableWarehouses: [],
            } 
          : line
      )
    );
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
    
    // Validate against maxQuantity if it exists
    const line = lines.find(l => l.id === id);
    if (line?.maxQuantity !== undefined && validValue) {
      const numValue = parseFloat(validValue);
      if (numValue > line.maxQuantity) {
        setErrors({ ...errors, [`line-${id}-quantity`]: `Cantidad máxima: ${line.maxQuantity}` });
        return;
      }
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
      // This should not happen if consumer data is loaded correctly
      logger.error('CreateAdvancedProductScreen: Missing date from consumer');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener la fecha de la salida de mercancías',
      });
      return false;
    }

    if (lines.length === 0) {
      newErrors.lines = 'Debe agregar al menos un material';
    }

    lines.forEach((line) => {
      if (!line.itemCode) {
        newErrors[`line-${line.id}-item`] = 'Seleccione un producto';
      }
      if (!line.quantity || parseFloat(line.quantity) <= 0) {
        newErrors[`line-${line.id}-quantity`] = 'Cantidad inválida';
      }
      // Validar contra maxQuantity (cantidad de la salida)
      if (line.maxQuantity !== undefined && line.quantity && parseFloat(line.quantity) > line.maxQuantity) {
        newErrors[`line-${line.id}-quantity`] = `Cantidad máxima: ${line.maxQuantity}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    logger.info('CreateAdvancedProductScreen: Submit pressed');

    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Error de Validación',
        text2: 'Por favor corrija los errores en el formulario',
      });
      return;
    }

    const productLines: CreateAdvancedProductLine[] = lines.map((line) => ({
      quantity: parseFloat(line.quantity),
      baseEntry: line.baseEntry,
      itemCode: line.itemCode,
      projectCode: line.projectCode || undefined,
      costingCode: line.costingCode || undefined,
      baseLine: line.baseLine,
      baseType: line.baseType,
      price: line.price,
      batchNumbers: line.batchNumbers && line.batchNumbers.length > 0 
        ? line.batchNumbers.map(bn => ({
            batchNumber: bn.batchNumber ? `${bn.batchNumber}.` : '',
            quantity: parseFloat(line.quantity),
          }))
        : undefined,
    }));

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

    logger.debug('CreateAdvancedProductScreen: Creating advanced product', { product });

    createAdvancedProduct(product, {
      onSuccess: (data) => {
        Toast.show({
          type: 'success',
          text1: 'Entrada Creada',
          text2: `Entrada #${data.docNum || data.docEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear la entrada de mercancías',
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
        <Text style={styles.headerTitle}>Nueva Entrada de Mercancías</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Información General</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Contabilización</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={docDueDate ? docDueDate.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
              }) : ''}
              editable={false}
              placeholder="Fecha de la salida"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.helperText}>
              La fecha se toma automáticamente de la salida de mercancías
            </Text>
          </View>
        </Card>

        {/* Materials Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Materiales</Text>

          {errors.lines && (
            <Text style={styles.errorText}>{errors.lines}</Text>
          )}

          {lines.map((line, index) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineTitle}>Material #{index + 1}</Text>
                <TouchableOpacity onPress={() => removeLine(line.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Producto</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={line.itemCode}
                  editable={false}
                  placeholder="Código del producto"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                {errors[`line-${line.id}-item`] && (
                  <Text style={styles.errorText}>{errors[`line-${line.id}-item`]}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={line.itemName}
                  editable={false}
                  placeholder="Nombre del producto"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Project Code - Read Only */}
              {line.projectCode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Proyecto</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={line.projectCode}
                    editable={false}
                    placeholder="Proyecto de la salida"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.helperText}>
                    El proyecto se toma automáticamente de la salida de mercancías
                  </Text>
                </View>
              )}

              {/* Costing Code (Cuartel/Profit Center) - Read Only */}
              {line.costingCode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cuartel</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={line.costingCodeName}
                    editable={false}
                    placeholder="Cuartel de la salida"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.helperText}>
                    El cuartel se toma automáticamente de la salida de mercancías
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Almacén</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={line.warehouseCode}
                  editable={false}
                  placeholder="Almacén de la salida"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text style={styles.helperText}>
                  El almacén se toma automáticamente de la salida de mercancías
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Cantidad{line.maxQuantity !== undefined ? ` (Máx: ${line.maxQuantity})` : ''}
                </Text>
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
                  <Text style={styles.label}>Lote</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={line.batchNumber}
                    editable={false}
                    placeholder="Lote de la salida"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.helperText}>
                    El lote se toma automáticamente de la salida de mercancías
                  </Text>
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Submit Button */}
        <Button
          title={isPending ? 'Creando...' : 'Crear Entrada'}
          onPress={handleSubmit}
          disabled={isPending}
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
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
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
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
