// Presentation - Create Consumer Screen
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
import { DatePickerInput } from '../components/DatePickerInput';
import { ItemSearchInput } from '../components/ItemSearchInput';
import { useCreateConsumer } from '../hooks/useCreateConsumer';
import { useProductionOrderById } from '../hooks/useProductionOrderById';
import { CreateConsumerLine, Consumer } from '../../domain/entities/consumer.entity';
import { Item } from '../../domain/entities/item.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateConsumer'>;

interface ConsumerLine {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  baseEntry?: number;
  baseLine?: number;
}

export const CreateConsumerScreen: React.FC<Props> = ({ navigation, route }) => {
  const productionOrderId = route.params?.productionOrderId;
  const { data: productionOrder } = useProductionOrderById(productionOrderId || 0);
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
        setDocDueDate(new Date(productionOrder.dueDate));
      }
      
      // Set memo with production order number
      setJournalMemo(`Salidas de mercancías para la orden de fabricación #${productionOrder.documentNumber}`);
      
      // Set lines from production order materials (only issued materials)
      const orderLines: ConsumerLine[] = productionOrder.productionOrderLines.map((line, index) => ({
        id: Date.now().toString() + index,
        itemCode: (line.itemNo ?? '') as string,
        itemName: (line.itemName ?? '') as string,
        quantity: '',
        baseEntry: productionOrder.absoluteEntry || 0,
        baseLine: line.lineNumber ?? index,
      }));
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
      quantity: '',
    };
    setLines([...lines, newLine]);
    // Clear "no materials" error when adding a line
    if (errors.lines) {
      setErrors({ ...errors, lines: '' });
    }
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
      if (line.quantity && parseFloat(line.quantity) < 0) {
        newErrors[`line-${line.id}-quantity`] = 'La cantidad no puede ser negativa';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    logger.info('CreateConsumerScreen: Submit pressed');

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
        itemCode: line.itemCode,
        baseEntry: line.baseEntry ?? null,
        baseLine: line.baseLine,
        baseType: 202, // Production Order type
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
        Toast.show({
          type: 'success',
          text1: 'Salida de Mercancías Creada',
          text2: `Salida de Mercancías #${data.docNum || data.docEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear la salida de mercancías',
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
        <Text style={styles.headerTitle}>Nueva Salida de Mercancías</Text>
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
            <Card key={line.id} style={styles.lineCard}>
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
            </Card>
          ))}

          <TouchableOpacity 
            onPress={addLine} 
            style={styles.addButtonBottom}
          >
            <Text style={styles.addButtonBottomText}>+ Agregar Material</Text>
          </TouchableOpacity>
        </Card>

        {/* Submit Button */}
        <Button
          title={isPending ? 'Creando...' : 'Crear Salida de Mercancías'}
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
});
