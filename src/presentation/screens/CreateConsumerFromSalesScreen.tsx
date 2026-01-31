// Presentation - Create Consumer From Sales Screen (Salida independiente)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { ProjectSearchInput } from '../components/ProjectSearchInput';
import { useCreateConsumer } from '../hooks/useCreateConsumer';
import { useProfitCenters } from '../hooks/useProfitCenters';
import { CreateConsumerLine, Consumer } from '../../domain/entities/consumer.entity';
import { Item } from '../../domain/entities/item.entity';
import { Project } from '../../domain/entities/project.entity';
import { logger } from '../../core/logging/logger';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateConsumerFromSales'>;

interface ConsumerLine {
  id: string;
  itemCode: string;
  itemName: string;
  projectCode: string;
  projectName: string;
  costingCode: string;
  quantity: string;
  warehouseCode: string;
  availableWarehouses: Array<{ code: string; name: string; inStock: number }>;
}

export const CreateConsumerFromSalesScreen: React.FC<Props> = ({ navigation }) => {
  const [docDueDate, setDocDueDate] = useState<Date | null>(null);
  const [comments, setComments] = useState('');
  const [journalMemo, setJournalMemo] = useState('Salida de mercancías');
  const [lines, setLines] = useState<ConsumerLine[]>([
    {
      id: Date.now().toString(),
      itemCode: '',
      itemName: '',
      projectCode: '',
      projectName: '',
      costingCode: '',
      quantity: '',
      warehouseCode: '',
      availableWarehouses: [],
    },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate: createConsumer, isPending } = useCreateConsumer();
  const { data: profitCenters = [], isLoading: isLoadingProfitCenters } = useProfitCenters();

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
      projectCode: '',
      projectName: '',
      costingCode: '',
      quantity: '',
      warehouseCode: '',
      availableWarehouses: [],
    };
    setLines([...lines, newLine]);
    // Clear "no materials" error when adding a line
    if (errors.lines) {
      setErrors({ ...errors, lines: '' });
    }
  };

  const updateLineItem = (id: string, item: Item) => {
    // Filter warehouses with InStock > 0
    const availableWarehouses = item.itemWarehouseInfoCollection
      .filter(w => w.inStock > 0)
      .map(w => ({
        code: w.warehouseCode || '',
        name: w.warehouseCode || '',
        inStock: w.inStock,
      }));

    setLines(
      lines.map((line) =>
        line.id === id
          ? { 
              ...line, 
              itemCode: item.itemCode, 
              itemName: item.itemName || '',
              warehouseCode: '', // Reset warehouse selection
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
              projectName: '',
              costingCode: '',
              warehouseCode: '',
              availableWarehouses: [],
            } 
          : line
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

  const updateLineWarehouse = (id: string, warehouseCode: string) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, warehouseCode } : line))
    );
    // Clear warehouse error when selected
    if (errors[`line-${id}-warehouse`]) {
      setErrors({ ...errors, [`line-${id}-warehouse`]: '' });
    }
  };

  const updateLineProject = (id: string, project: Project) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, projectCode: project.code, projectName: project.name || '' } : line))
    );
    // Clear error when project is selected
    if (errors[`line-${id}-project`]) {
      setErrors({ ...errors, [`line-${id}-project`]: '' });
    }
  };

  const clearLineProject = (id: string) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, projectCode: '', projectName: '' } : line))
    );
    // Clear error when project is cleared
    if (errors[`line-${id}-project`]) {
      setErrors({ ...errors, [`line-${id}-project`]: '' });
    }
  };

  const updateLineCostingCode = (id: string, costingCode: string) => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, costingCode } : line))
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
      if (line.itemCode && !line.warehouseCode) {
        newErrors[`line-${line.id}-warehouse`] = 'Seleccione un almacén';
      }
      // Validate project is valid if entered (field is optional but must be valid)
      if (line.projectCode && !line.projectName) {
        newErrors[`line-${line.id}-project`] = 'El proyecto ingresado no es válido';
      }
      if (line.quantity && parseFloat(line.quantity) < 0) {
        newErrors[`line-${line.id}-quantity`] = 'La cantidad no puede ser negativa';
      }
      // Validar que la cantidad no exceda el stock disponible
      if (line.quantity && line.warehouseCode && parseFloat(line.quantity) > 0) {
        const selectedWarehouse = line.availableWarehouses.find(w => w.code === line.warehouseCode);
        if (selectedWarehouse && parseFloat(line.quantity) > selectedWarehouse.inStock) {
          newErrors[`line-${line.id}-quantity`] = `La cantidad no puede ser mayor al stock disponible (${selectedWarehouse.inStock})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    logger.info('CreateConsumerFromSalesScreen: Submit pressed');

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
        warehouseCode: line.warehouseCode,
        projectCode: line.projectCode || undefined,
        costingCode: line.costingCode || undefined,
        baseEntry: null,
        baseLine: undefined,
        baseType: -1, // not order
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
      journalMemo: journalMemo || 'Salida de mercancías creada desde app',
      documentLines: consumerLines,
    };

    createConsumer(consumer, {
      onSuccess: (data: Consumer) => {
        Toast.show({
          type: 'success',
          text1: 'Salida Creada',
          text2: `Salida #${data.docNum || data.docEntry} creada exitosamente`,
        });
        navigation.goBack();
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'No se pudo crear la salida',
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

              <ItemSearchInput
                value={line.itemCode}
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

              {/* Project Code */}
              <ProjectSearchInput
                value={line.projectCode}
                onSelectProject={(project) => updateLineProject(line.id, project)}
                onClear={() => clearLineProject(line.id)}
                label="Proyecto (Opcional)"
                placeholder="Buscar proyecto..."
                error={errors[`line-${line.id}-project`]}
              />

              {/* Costing Code (Cuartel/Profit Center) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cuartel (Opcional)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={line.costingCode}
                    onValueChange={(value) => updateLineCostingCode(line.id, value)}
                    enabled={!isLoadingProfitCenters}
                    style={styles.picker}
                  >
                    <Picker.Item 
                      label="Seleccione cuartel" 
                      value="" 
                      color={theme.colors.textSecondary}
                    />
                    {profitCenters.map((profitCenter) => (
                      <Picker.Item
                        key={profitCenter.centerCode}
                        label={profitCenter.centerName || profitCenter.centerCode}
                        value={profitCenter.centerCode}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Warehouse Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Almacén</Text>
                {line.itemCode && line.availableWarehouses.length === 0 ? (
                  <View style={styles.noStockContainer}>
                    <Text style={styles.noStockText}>
                      ⚠️ No hay stock disponible en ningún almacén
                    </Text>
                  </View>
                ) : (
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
                      {line.availableWarehouses.map((warehouse) => (
                        <Picker.Item
                          key={warehouse.code}
                          label={`${warehouse.name} (Stock: ${warehouse.inStock})`}
                          value={warehouse.code}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
                {errors[`line-${line.id}-warehouse`] && (
                  <Text style={styles.errorText}>{errors[`line-${line.id}-warehouse`]}</Text>
                )}
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
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
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
  noStockContainer: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFE69C',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  noStockText: {
    fontSize: theme.fontSize.sm,
    color: '#856404',
    textAlign: 'center',
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
