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
import { ItemSearchInput } from '../components/ItemSearchInput';
import { DatePickerInput } from '../components/DatePickerInput';
import { useCreateAdvancedProduct } from '../hooks/useCreateAdvancedProduct';
import { useConsumerById } from '../hooks/useConsumerById';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { Item } from '../../domain/entities/item.entity';
import { CreateAdvancedProductLine } from '../../domain/entities/advanced-product.entity';
import { BatchNumbers } from '../../domain/entities/batch-numbers.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateAdvancedProduct'>;

interface AdvancedProductLine {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  maxQuantity?: number;
  baseEntry: number | null;
  baseLine?: number;
  baseType?: number | null;
  batchNumbers?: BatchNumbers[];
}

export const CreateAdvancedProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const consumerId = route.params?.consumerId;
  const productionOrderId = route.params?.productionOrderId;
  const { data: sourceConsumer } = useConsumerById(consumerId || 0);
  const { data: productionOrder } = useProductionOrderById(productionOrderId || 0);
  const [docDueDate, setDocDueDate] = useState<Date | null>(null);
  const [comments, setComments] = useState('');
  const [journalMemo, setJournalMemo] = useState('');
  const [lines, setLines] = useState<AdvancedProductLine[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form with consumer data
  React.useEffect(() => {
    if (sourceConsumer && consumerId) {
      logger.debug('CreateAdvancedProductScreen: Initializing from consumer', { 
        docDueDate: sourceConsumer.docDueDate,
        docDate: sourceConsumer.docDate,
        comments: sourceConsumer.comments,
        journalMemo: sourceConsumer.journalMemo,
        linesCount: sourceConsumer.documentLines.length
      });
      
      // Set dates - try docDueDate first, then docDate as fallback
      const dateToUse = sourceConsumer.docDueDate || sourceConsumer.docDate;
      if (dateToUse) {
        const parsedDate = new Date(dateToUse);
        logger.debug('CreateAdvancedProductScreen: Setting date', { dateToUse, parsedDate });
        setDocDueDate(parsedDate);
      }
      // Set comments and memo
      setComments(sourceConsumer.comments || '');
      setJournalMemo(`Entrada generada con la salida #${sourceConsumer.docNum}`);
      // Set lines from consumer
      const consumerLines: AdvancedProductLine[] = sourceConsumer.documentLines.map((line, index) => ({
        id: Date.now().toString() + index,
        itemCode: line.itemCode || '',
        itemName: line.itemDescription || '',
        quantity: line.quantity.toString(),
        maxQuantity: line.quantity,
        baseEntry: sourceConsumer.docEntry || null,
        baseLine: line.lineNumber,
        baseType: 60,
        batchNumbers: line.batchNumbers,
      }));
      setLines(consumerLines);
    }
  }, [sourceConsumer, consumerId]);

  // Initialize form with production order data (for production receipt)
  React.useEffect(() => {
    if (productionOrder && productionOrderId) {
      logger.debug('CreateAdvancedProductScreen: Initializing from production order', { 
        absoluteEntry: productionOrder.absoluteEntry,
        itemNo: productionOrder.itemNo
      });
      
      // Set dates
      if (productionOrder.dueDate) {
        setDocDueDate(new Date(productionOrder.dueDate));
      }
      
      // Set memo with production order number
      setJournalMemo(`Recibo de producción para la orden de fabricación #${productionOrder.documentNumber}`);
      
      // Set single line for finished product
      const productionLine: AdvancedProductLine = {
        id: Date.now().toString(),
        itemCode: productionOrder.itemNo || '',
        itemName: productionOrder.itemNo || '',
        quantity: '',
        maxQuantity: undefined,
        baseEntry: productionOrder.absoluteEntry || null,
        baseLine: undefined,
        baseType: undefined,
        batchNumbers: undefined,
      };
      setLines([productionLine]);
    }
  }, [productionOrder, productionOrderId]);

  const { mutate: createAdvancedProduct, isPending } = useCreateAdvancedProduct();

  const handleDueDateChange = (date: Date) => {
    setDocDueDate(date);
    // Clear error when date is selected
    if (errors.docDueDate) {
      setErrors({ ...errors, docDueDate: '' });
    }
  };

  const addLine = () => {
    const newLine: AdvancedProductLine = {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      quantity: '',
      maxQuantity: undefined,
      baseEntry: null,
      baseLine: undefined,
      baseType: null,
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
    setLines(
      lines.map((line) =>
        line.id === id
          ? { ...line, itemCode: item.itemCode, itemName: item.itemName || '' }
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
        line.id === id ? { ...line, itemCode: '', itemName: '' } : line
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
      newErrors.docDueDate = 'Seleccione la fecha de entrega';
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

    const productLines: CreateAdvancedProductLine[] = lines.map((line) => {
      const baseLine: CreateAdvancedProductLine = {
        quantity: parseFloat(line.quantity),
        baseEntry: line.baseEntry,
      };
      
      // Only include itemCode, baseLine, baseType for consumer-based entries
      if (!productionOrderId) {
        baseLine.itemCode = line.itemCode;
        baseLine.baseLine = line.baseLine;
        baseLine.baseType = line.baseType;
      }
      
      // Add batch numbers if present
      if (line.batchNumbers && line.batchNumbers.length > 0) {
        baseLine.batchNumbers = line.batchNumbers;
      }
      
      return baseLine;
    });

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
          text1: productionOrderId ? 'Recibo Creado' : 'Entrada Creada',
          text2: productionOrderId 
            ? `Recibo de producción #${data.docNum || data.docEntry} creado exitosamente`
            : `Entrada #${data.docNum || data.docEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || (productionOrderId 
            ? 'No se pudo crear el recibo de producción' 
            : 'No se pudo crear la entrada de mercancías'),
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
        <Text style={styles.headerTitle}>
          {productionOrderId ? 'Recibo de producción' : 'Nueva Entrada de Mercancías'}
        </Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comentarios</Text>
            <TextInput
              style={styles.textArea}
              value={comments}
              onChangeText={setComments}
              placeholder="Comentarios adicionales..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Memo del Diario</Text>
            <TextInput
              style={styles.textArea}
              value={journalMemo}
              onChangeText={setJournalMemo}
              placeholder="Memo del diario..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>

        {/* Materials Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Producto</Text>

          {errors.lines && (
            <Text style={styles.errorText}>{errors.lines}</Text>
          )}

          {lines.map((line, index) => (
            <Card key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineTitle}>
                  {productionOrderId ? 'Producto a Fabricar' : `Material #${index + 1}`}
                </Text>
                {!productionOrderId && (
                  <TouchableOpacity onPress={() => removeLine(line.id)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {productionOrderId ? (
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
              ) : (
                <ItemSearchInput
                  value={line.itemCode}
                  onSelectItem={(item) => updateLineItem(line.id, item)}
                  onClear={() => clearLineItem(line.id)}
                  label="Producto"
                  placeholder="Buscar código de producto..."
                  error={errors[`line-${line.id}-item`]}
                />
              )}

              {!productionOrderId && (
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
              )}

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
            </Card>
          ))}

          {!productionOrderId && (
            <TouchableOpacity onPress={addLine} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Agregar Material</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Submit Button */}
        <Button
          title={isPending ? 'Creando...' : (productionOrderId ? 'Crear Recibo de Producción' : 'Crear Entrada')}
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
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
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
