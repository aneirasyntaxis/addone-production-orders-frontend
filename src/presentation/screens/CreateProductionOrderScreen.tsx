// Presentation - Create Production Order Screen
import React, { useState, useEffect } from 'react';
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
import { ItemSearchInput } from '../components/ItemSearchInput';
import { ProductTreeSearchInput } from '../components/ProductTreeSearchInput';
import { DatePickerInput } from '../components/DatePickerInput';
import { WarehouseSearchInput } from '../components/WarehouseSearchInput';
import { useCreateProductionOrder } from '../hooks/useCreateProductionOrder';
import { Item } from '../../domain/entities/item.entity';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { ProductTree } from '../../domain/entities/product-tree.entity';
import { CreateProductionOrderLine } from '../../domain/entities/production-order.entity';
import { logger } from '../../core/logging/logger';
import { productTreeApi } from '../../data/api/product-tree.api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProductionOrder'>;

type OrderMode = 'standard' | 'special';

interface ProductionOrderLine {
  id: string;
  itemNo: string;
  itemName: string;
  //baseQuantity: string;
  plannedQuantity: string;
  warehouseCode: string;
  productionOrderIssueType: string;
  itemType?: string;
  lineText?: string;
  defaultWarehouse: string;
  availableWarehouses: Array<{ code: string; name: string; inStock: number }>;
}

type IssueMethodDisplay = 'Manual' | 'Notificación';

const issueMethodToApi = (display: IssueMethodDisplay): string => {
  return display === 'Manual' ? 'im_Manual' : 'im_Backflush';
};

const apiToIssueMethodDisplay = (apiValue: string): IssueMethodDisplay => {
  return apiValue === 'im_Manual' ? 'Manual' : 'Notificación';
};

export const CreateProductionOrderScreen: React.FC<Props> = ({ navigation }) => {
  const [mode, setMode] = useState<OrderMode>('standard');
  const [headerItemNo, setHeaderItemNo] = useState('');
  const [headerItemName, setHeaderItemName] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState('');
  const [postingDate, setPostingDate] = useState<Date | null>(new Date());
  const [headerWarehouseCode, setHeaderWarehouseCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [journalRemarks, setJournalRemarks] = useState('');
  const [lines, setLines] = useState<ProductionOrderLine[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingProductTree, setIsLoadingProductTree] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate: createOrder, isPending } = useCreateProductionOrder();

  const handleProductTreeSelect = async (productTree: ProductTree) => {
    logger.debug('CreateProductionOrderScreen: Product tree selected from search', {
      treeCode: productTree.treeCode,
    });

    // Mostrar loading mientras se obtienen los detalles completos
    setIsLoadingProductTree(true);

    try {
      // Llamar al servicio /{treeCode} para obtener datos completos con itemWarehouseInfoCollection
      logger.debug('CreateProductionOrderScreen: Loading full product tree details', {
        treeCode: productTree.treeCode,
      });

      const fullProductTree = await productTreeApi.getByTreeCode(productTree.treeCode);

      if (!fullProductTree) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudo cargar la información completa del producto',
        });
        setIsLoadingProductTree(false);
        return;
      }

      logger.debug('CreateProductionOrderScreen: Full product tree loaded', {
        treeCode: fullProductTree.treeCode,
        linesCount: fullProductTree.productTreeLines.length,
        quantity: fullProductTree.quantity,
      });

      setHeaderItemNo(fullProductTree.treeCode);
      setHeaderItemName(fullProductTree.productDescription || fullProductTree.treeCode);
      setPlannedQuantity(fullProductTree.quantity.toString());
      setHeaderWarehouseCode(fullProductTree.warehouse || '');

      // Clear error
      if (errors.headerItem) {
        setErrors({ ...errors, headerItem: '' });
      }

      // Load product tree lines with full information (warehouse info)
      const newLines: ProductionOrderLine[] = fullProductTree.productTreeLines.map((line, index) => {
        const defaultWarehouse = line.warehouse || '';
        
        // Filter warehouses: show those with stock > 0, and always include default warehouse
        // pit_Resource y pit_Text no necesitan almacén
        let availableWarehouses: Array<{ code: string; name: string; inStock: number }> = [];
        
        if (line.itemType === 'pit_Item') {
          // Filtrar almacenes con stock > 0 O que sean el almacén por defecto
          if (line.itemWarehouseInfoCollection && line.itemWarehouseInfoCollection.length > 0) {
            availableWarehouses = line.itemWarehouseInfoCollection
              .filter(w => {
                const hasStock = (w.inStock ?? 0) > 0;
                const isDefault = w.warehouseCode === defaultWarehouse;
                return hasStock || isDefault;
              })
              .map(w => ({
                code: w.warehouseCode || '',
                name: w.warehouseCode || '',
                inStock: w.inStock ?? 0,
              }));
          }

          // SIEMPRE agregar el almacén por defecto si existe y no está en la lista
          if (defaultWarehouse && !availableWarehouses.some(w => w.code === defaultWarehouse)) {
            availableWarehouses.unshift({
              code: defaultWarehouse,
              name: defaultWarehouse,
              inStock: 0,
            });
          }
        }
        
        return {
          id: `${Date.now()}-${index}`,
          itemNo: line.itemCode,
          itemName: line.itemName,
         // baseQuantity: '',
          plannedQuantity: line.quantity.toString(),
          warehouseCode: defaultWarehouse,
          productionOrderIssueType: line.issueMethod || 'im_Manual',
          itemType: line.itemType,
          lineText: line.lineText || '',
          defaultWarehouse,
          availableWarehouses,
        };
      });

      setLines(newLines);

      Toast.show({
        type: 'success',
        text1: 'Lista Cargada',
        text2: `Se cargaron ${newLines.length} materiales de la lista estándar`,
      });
    } catch (error) {
      logger.error('CreateProductionOrderScreen: Error loading full product tree', { error });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información del producto',
      });
    } finally {
      setIsLoadingProductTree(false);
    }
  };

  const handleModeChange = (newMode: OrderMode) => {
    if (mode !== newMode) {
      setMode(newMode);
      // Reset entire form when changing mode
      setHeaderItemNo('');
      setHeaderItemName('');
      setPlannedQuantity('');
      setPostingDate(new Date());
      setHeaderWarehouseCode('');
      setRemarks('');
      setJournalRemarks('');
      setLines([]);
      setErrors({});
      setIsLoadingProductTree(false);
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
    setHeaderWarehouseCode('');
    setLines([]);
    setIsLoadingProductTree(false);
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

  const handlePostingDateChange = (date: Date) => {
    setPostingDate(date);
    // Clear error when date is selected
    if (errors.postingDate) {
      setErrors({ ...errors, postingDate: '' });
    }
  };

  const handleHeaderWarehouseSelect = (warehouse: Warehouse) => {
    setHeaderWarehouseCode(warehouse.warehouseCode);
    // Clear error when warehouse is selected
    if (errors.headerWarehouse) {
      setErrors({ ...errors, headerWarehouse: '' });
    }
  };

  const handleHeaderWarehouseClear = () => {
    setHeaderWarehouseCode('');
  };

  const addLine = () => {
    const newLine: ProductionOrderLine = {
      id: Date.now().toString(),
      itemNo: '',
      itemName: '',
     // baseQuantity: '',
      plannedQuantity: '',
      warehouseCode: '',
      productionOrderIssueType: 'im_Manual',
      defaultWarehouse: '',
      availableWarehouses: [],
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
    // Filter warehouses: show those with stock > 0
    // Note: In special mode there's no default warehouse, so show all with stock > 0
    const availableWarehouses = item.itemWarehouseInfoCollection
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
              itemNo: item.itemCode, 
              itemName: item.itemName || '',
              warehouseCode: '', // Reset warehouse selection
              defaultWarehouse: '',
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
              itemNo: '', 
              itemName: '',
              warehouseCode: '',
              defaultWarehouse: '',
              availableWarehouses: [],
            } 
          : line
      )
    );
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

  const updateLine = (id: string, field: keyof ProductionOrderLine, value: string) => {
    let validValue = value;
    
    // Validate numeric fields
    //if (field === 'baseQuantity' || field === 'plannedQuantity') {
    if (field === 'plannedQuantity') {
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
    if (field === 'plannedQuantity' && errors[`line-${id}-quantity`] && validValue && parseFloat(validValue) > 0) {
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

    if (!postingDate) {
      newErrors.postingDate = 'Seleccione la fecha de publicación';
    }

    if (!headerWarehouseCode) {
      newErrors.headerWarehouse = 'Seleccione un almacén';
    }

    if (lines.length === 0) {
      newErrors.lines = 'Debe agregar al menos un material';
    }

    lines.forEach((line, index) => {
      // Solo validar itemNo si NO es tipo texto (pit_Text)
      if (line.itemType !== 'pit_Text') {
        if (!line.itemNo) {
          newErrors[`line-${line.id}-item`] = 'Seleccione un producto';
        }
        // pit_Resource no requiere almacén (son recursos como mano de obra)
        if (line.itemType !== 'pit_Resource' && !line.warehouseCode) {
          newErrors[`line-${line.id}-warehouse`] = 'Seleccione un almacén';
        }
        if (!line.plannedQuantity || parseFloat(line.plannedQuantity) <= 0) {
          newErrors[`line-${line.id}-quantity`] = 'Cantidad inválida';
        }
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
      baseQuantity: undefined,
      plannedQuantity: line.itemType === 'pit_Text' ? undefined : parseFloat(line.plannedQuantity),
      warehouseCode: (line.itemType === 'pit_Text' || line.itemType === 'pit_Resource') ? undefined : line.warehouseCode,
      productionOrderIssueType: line.itemType === 'pit_Text' ? undefined : 'im_Manual',
      itemType: line.itemType,
      lineText: line.itemType === 'pit_Text' ? line.lineText : undefined,
    }));

    const formatDateForApi = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const order = {
      productionOrderType: mode === 'standard' ? 'bopotStandard' : 'bopotSpecial',
      itemNo: headerItemNo,
      warehouse: headerWarehouseCode,
      plannedQuantity: parseFloat(plannedQuantity),
      dueDate: formatDateForApi(postingDate!),
      postingDate: formatDateForApi(postingDate!),
      remarks: undefined,
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
            <>
              <ProductTreeSearchInput
                value={headerItemName}
                onSelectProductTree={handleProductTreeSelect}
                onClear={handleHeaderItemClear}
                label="Producto"
                placeholder="Buscar producto..."
                error={errors.headerItem}
              />
              {isLoadingProductTree && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Cargando información del producto...</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <ItemSearchInput
                value={headerItemName}
                onSelectItem={handleHeaderItemSelect}
                onClear={handleHeaderItemClear}
                label="Producto"
                placeholder="Buscar producto..."
                error={errors.headerItem}
              />
            </>
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
            value={postingDate}
            onChange={handlePostingDateChange}
            label="Fecha de Publicación"
            placeholder="Seleccionar fecha de publicación"
            error={errors.postingDate}
          />

          <WarehouseSearchInput
            label="Almacén"
            value={headerWarehouseCode}
            onSelectWarehouse={handleHeaderWarehouseSelect}
            onClear={handleHeaderWarehouseClear}
            placeholder="Buscar almacén..."
            error={errors.headerWarehouse}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comentarios</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={remarks}
              onChangeText={setRemarks}
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
                <Text style={styles.lineTitle}>
                  {line.itemType === 'pit_Text' ? `Texto #${index + 1}` : `Material #${index + 1}`}
                </Text>
                <TouchableOpacity onPress={() => removeLine(line.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {line.itemType !== 'pit_Text' && (
                <>
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

                  {/* pit_Resource (recursos como mano de obra) no requieren almacén */}
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
                          {line.availableWarehouses.map((warehouse) => (
                            <Picker.Item
                              key={warehouse.code}
                              label={`${warehouse.name} (Stock: ${warehouse.inStock ?? 0})`}
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
                </>
              )}

              {line.itemType === 'pit_Text' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Texto Libre (máximo 50 caracteres)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={line.lineText || ''}
                    onChangeText={(value) => {
                      if (value.length <= 50) {
                        updateLine(line.id, 'lineText', value);
                      }
                    }}
                    placeholder="Escriba el texto descriptivo..."
                    multiline
                    numberOfLines={3}
                    maxLength={50}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.characterCount}>
                    {(line.lineText || '').length}/50
                  </Text>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cantidad Planificada</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors[`line-${line.id}-quantity`] && styles.inputError,
                    ]}
                    value={line.plannedQuantity}
                    onChangeText={(value) => updateLine(line.id, 'plannedQuantity', value)}
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
              )}

            </View>
          ))}

          {lines.length === 0 && headerItemNo ? (
            <View style={styles.emptyLines}>
              <Text style={styles.emptyLinesText}>
                No hay materiales agregados. Presione "Agregar" para comenzar.
              </Text>
            </View>
          ) : null}

          {isLoadingItems && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Cargando información de productos...</Text>
            </View>
          )}

          {headerItemNo ? (
            <TouchableOpacity 
              onPress={addLine} 
              style={[
                styles.addButtonBottom,
                (isLoadingItems || isLoadingProductTree) && styles.addButtonBottomDisabled
              ]}
              disabled={isLoadingItems || isLoadingProductTree}
            >
              <Text style={[
                styles.addButtonBottomText,
                (isLoadingItems || isLoadingProductTree) && styles.addButtonBottomTextDisabled
              ]}>
                + Agregar Material
              </Text>
            </TouchableOpacity>
          ) : null}
        </Card>

        <Button
          title={isPending ? 'Creando...' : 'Crear Orden de Fabricación'}
          onPress={handleSubmit}
          disabled={isPending || isLoadingItems || isLoadingProductTree}
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
  addButtonBottomDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  addButtonBottomTextDisabled: {
    color: theme.colors.textSecondary,
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
    marginBottom: theme.spacing.sm,
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
  characterCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
  lineCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
