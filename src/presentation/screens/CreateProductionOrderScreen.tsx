// Presentation - Create Production Order Screen
import React, { useState, useEffect } from 'react';
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
import { ProductTreeSearchInput } from '../components/ProductTreeSearchInput';
import { DatePickerInput } from '../components/DatePickerInput';
import { useCreateProductionOrder } from '../hooks/useCreateProductionOrder';
import { Item } from '../../domain/entities/item.entity';
import { ProductTree } from '../../domain/entities/product-tree.entity';
import { CreateProductionOrderLine } from '../../domain/entities/production-order.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProductionOrder'>;

type OrderMode = 'standard' | 'special';

interface ProductionOrderLine {
  id: string;
  itemNo: string;
  itemName: string;
  baseQuantity: string;
  plannedQuantity: string;
  productionOrderIssueType: string;
}

export const CreateProductionOrderScreen: React.FC<Props> = ({ navigation }) => {
  const [mode, setMode] = useState<OrderMode>('standard');
  const [headerItemNo, setHeaderItemNo] = useState('');
  const [headerItemName, setHeaderItemName] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [postingDate, setPostingDate] = useState<Date | null>(null);
  const [remarks, setRemarks] = useState('');
  const [journalRemarks, setJournalRemarks] = useState('');
  const [lines, setLines] = useState<ProductionOrderLine[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate: createOrder, isPending } = useCreateProductionOrder();

  const handleProductTreeSelect = (productTree: ProductTree) => {
    logger.debug('CreateProductionOrderScreen: Product tree selected', {
      treeCode: productTree.treeCode,
      linesCount: productTree.productTreeLines.length,
      quantity: productTree.quantity,
    });

    setHeaderItemNo(productTree.treeCode);
    setHeaderItemName(productTree.productDescription || productTree.treeCode);
    setPlannedQuantity(productTree.quantity.toString());

    // Clear error
    if (errors.headerItem) {
      setErrors({ ...errors, headerItem: '' });
    }

    // Load product tree lines immediately
    const newLines: ProductionOrderLine[] = productTree.productTreeLines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      itemNo: line.itemCode,
      itemName: line.itemName,
      baseQuantity: line.quantity.toString(),
      plannedQuantity: '',
      productionOrderIssueType: 'bopoit_Manual',
    }));

    setLines(newLines);

    Toast.show({
      type: 'success',
      text1: 'Lista Cargada',
      text2: `Se cargaron ${newLines.length} materiales de la lista estándar`,
    });
  };

  const handleModeChange = (newMode: OrderMode) => {
    if (mode !== newMode) {
      setMode(newMode);
      // Reset entire form when changing mode
      setHeaderItemNo('');
      setHeaderItemName('');
      setPlannedQuantity('');
      setDueDate(null);
      setPostingDate(null);
      setRemarks('');
      setJournalRemarks('');
      setLines([]);
      setErrors({});
      logger.info('CreateProductionOrderScreen: Mode changed, form reset', { newMode });
    }
  };

  const handleHeaderItemSelect = (item: Item) => {
    setHeaderItemNo(item.itemCode);
    setHeaderItemName(item.itemName || '');
    // Clear error when item is selected
    if (errors.headerItem) {
      setErrors({ ...errors, headerItem: '' });
    }
    // In special mode, clear lines when item changes
    setLines([]);
  };

  const handleHeaderItemClear = () => {
    setHeaderItemNo('');
    setHeaderItemName('');
    setLines([]);
  };

  const handlePlannedQuantityChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    let validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    // Remove leading zeros except for decimals (0.5 is valid, but 007 becomes 7)
    if (validValue && !validValue.startsWith('0.')) {
      validValue = validValue.replace(/^0+/, '') || '0';
    }
    
    setPlannedQuantity(validValue);
    // Clear error when valid quantity is entered
    if (errors.plannedQuantity && validValue && parseFloat(validValue) > 0) {
      setErrors({ ...errors, plannedQuantity: '' });
    }
  };

  const handleDueDateChange = (date: Date) => {
    setDueDate(date);
    // Clear error when date is selected
    if (errors.dueDate) {
      setErrors({ ...errors, dueDate: '' });
    }
  };

  const addLine = () => {
    const newLine: ProductionOrderLine = {
      id: Date.now().toString(),
      itemNo: '',
      itemName: '',
      baseQuantity: '',
      plannedQuantity: '',
      productionOrderIssueType: 'bopoit_Manual',
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
          ? { ...line, itemNo: item.itemCode, itemName: item.itemName || '' }
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
        line.id === id ? { ...line, itemNo: '', itemName: '' } : line
      )
    );
  };

  const updateLine = (id: string, field: keyof ProductionOrderLine, value: string) => {
    let validValue = value;
    
    // Validate numeric fields
    if (field === 'baseQuantity' || field === 'plannedQuantity') {
      // Only allow numbers and decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      // Remove leading zeros except for decimals (0.5 is valid, but 007 becomes 7)
      if (validValue && !validValue.startsWith('0.')) {
        validValue = validValue.replace(/^0+/, '') || '0';
      }
    }
    
    setLines(
      lines.map((line) => (line.id === id ? { ...line, [field]: validValue } : line))
    );
    // Clear quantity error when valid value is entered
    if (field === 'baseQuantity' && errors[`line-${id}-quantity`] && validValue && parseFloat(validValue) > 0) {
      setErrors({ ...errors, [`line-${id}-quantity`]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!headerItemNo) {
      newErrors.headerItem = 'Seleccione un producto';
    }

    if (!plannedQuantity || parseFloat(plannedQuantity) <= 0) {
      newErrors.plannedQuantity = 'Ingrese una cantidad válida';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Seleccione la fecha de entrega';
    }

    if (lines.length === 0) {
      newErrors.lines = 'Debe agregar al menos un material';
    }

    lines.forEach((line, index) => {
      if (!line.itemNo) {
        newErrors[`line-${line.id}-item`] = 'Seleccione un producto';
      }
      if (!line.baseQuantity || parseFloat(line.baseQuantity) <= 0) {
        newErrors[`line-${line.id}-quantity`] = 'Cantidad inválida';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    logger.info('CreateProductionOrderScreen: Submit pressed');

    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Error de Validación',
        text2: 'Por favor corrija los errores en el formulario',
      });
      return;
    }

    const orderLines: CreateProductionOrderLine[] = lines.map((line) => ({
      itemNo: line.itemNo,
      baseQuantity: parseFloat(line.baseQuantity),
      plannedQuantity: line.plannedQuantity ? parseFloat(line.plannedQuantity) : undefined,
      productionOrderIssueType: line.productionOrderIssueType,
    }));

    const formatDateForApi = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const order = {
      itemNo: headerItemNo,
      plannedQuantity: parseFloat(plannedQuantity),
      dueDate: formatDateForApi(dueDate!),
      postingDate: postingDate ? formatDateForApi(postingDate) : undefined,
      remarks: remarks || undefined,
      journalRemarks: journalRemarks || undefined,
      productionOrderLines: orderLines,
    };

    logger.debug('CreateProductionOrderScreen: Creating order', { order });

    createOrder(order, {
      onSuccess: (data) => {
        Toast.show({
          type: 'success',
          text1: 'Orden Creada',
          text2: `OF #${data.documentNumber || data.absoluteEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear la orden de fabricación',
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
        <Text style={styles.headerTitle}>Nueva Orden de Fabricación</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Información General</Text>

          {/* Mode Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Orden</Text>
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'standard' && styles.modeButtonActive,
                ]}
                onPress={() => handleModeChange('standard')}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'standard' && styles.modeButtonTextActive,
                  ]}
                >
                  Estándar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'special' && styles.modeButtonActive,
                ]}
                onPress={() => handleModeChange('special')}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'special' && styles.modeButtonTextActive,
                  ]}
                >
                  Especial
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'standard' ? (
            <ProductTreeSearchInput
              value={headerItemName}
              onSelectProductTree={handleProductTreeSelect}
              onClear={handleHeaderItemClear}
              label="Producto"
              placeholder="Buscar producto..."
              error={errors.headerItem}
            />
          ) : (
            <ItemSearchInput
              value={headerItemName}
              onSelectItem={handleHeaderItemSelect}
              onClear={handleHeaderItemClear}
              label="Producto"
              placeholder="Buscar producto..."
              error={errors.headerItem}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad Planificada</Text>
            <TextInput
              style={[styles.input, errors.plannedQuantity && styles.inputError]}
              value={plannedQuantity}
              onChangeText={handlePlannedQuantityChange}
              placeholder="Ej: 100"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.plannedQuantity && (
              <Text style={styles.errorText}>{errors.plannedQuantity}</Text>
            )}
          </View>

          <DatePickerInput
            value={dueDate}
            onChange={handleDueDateChange}
            label="Fecha de Entrega"
            placeholder="Seleccionar fecha de entrega"
            error={errors.dueDate}
          />

          <DatePickerInput
            value={postingDate}
            onChange={setPostingDate}
            label="Fecha de Publicación"
            placeholder="Seleccionar fecha (Opcional)"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Observaciones generales..."
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comentarios</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={journalRemarks}
              onChangeText={setJournalRemarks}
              placeholder="Comentarios..."
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* Materials Section */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materiales ({lines.length})</Text>
          </View>

          {errors.lines && <Text style={styles.errorText}>{errors.lines}</Text>}
          
          {!headerItemNo ? (
            <View style={styles.emptyLines}>
              <Text style={styles.emptyLinesText}>
                Seleccione primero el producto a fabricar para agregar materiales
              </Text>
            </View>
          ) : null}

          {lines.map((line, index) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineTitle}>Material #{index + 1}</Text>
                <TouchableOpacity onPress={() => removeLine(line.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <ItemSearchInput
                value={line.itemNo}
                onSelectItem={(item) => updateLineItem(line.id, item)}
                onClear={() => clearLineItem(line.id)}
                label="Producto"
                placeholder="Buscar producto..."
                error={errors[`line-${line.id}-item`]}
              />

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
                <Text style={styles.label}>Cantidad Base</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors[`line-${line.id}-quantity`] && styles.inputError,
                  ]}
                  value={line.baseQuantity}
                  onChangeText={(value) => updateLine(line.id, 'baseQuantity', value)}
                  placeholder="Ej: 10"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                {errors[`line-${line.id}-quantity`] && (
                  <Text style={styles.errorText}>
                    {errors[`line-${line.id}-quantity`]}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad Planificada</Text>
                <TextInput
                  style={styles.input}
                  value={line.plannedQuantity}
                  onChangeText={(value) => updateLine(line.id, 'plannedQuantity', value)}
                  placeholder="Opcional"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          ))}

          {lines.length === 0 && headerItemNo ? (
            <View style={styles.emptyLines}>
              <Text style={styles.emptyLinesText}>
                No hay materiales agregados. Presione "Agregar" para comenzar.
              </Text>
            </View>
          ) : null}

          {headerItemNo ? (
            <TouchableOpacity 
              onPress={addLine} 
              style={styles.addButtonBottom}
            >
              <Text style={styles.addButtonBottomText}>+ Agregar Material</Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        <Button
          title={isPending ? 'Creando...' : 'Crear Orden de Fabricación'}
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
    paddingBottom: 40,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  addButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  addButtonBottom: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonBottomText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  modeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modeButtonTextActive: {
    color: theme.colors.background,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  lineCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyLinesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
});
