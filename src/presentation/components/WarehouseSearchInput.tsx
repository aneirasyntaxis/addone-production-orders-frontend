// Presentation - Warehouse Search Input Component
import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { theme } from '../theme/theme';
import { useWarehouses } from '../hooks/useWarehouses';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { SEARCH_DEBOUNCE_MS } from '../../core/config/search.config';

interface WarehouseWithStock {
  code: string;
  name: string;
  inStock: number;
}

interface WarehouseSearchInputProps {
  value: string;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  warehouses?: WarehouseWithStock[]; // Optional: if provided, use these instead of fetching
}

export const WarehouseSearchInput: React.FC<WarehouseSearchInputProps> = ({
  value,
  onSelectWarehouse,
  onClear,
  placeholder = 'Buscar almacén...',
  label,
  error,
  warehouses, // Use provided warehouses if available
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Only fetch warehouses if not provided via props
  const { data: fetchedWarehouses, isLoading } = useWarehouses();

  // Convert provided warehouses to Warehouse format or use fetched ones
  const allWarehouses = useMemo(() => {
    if (warehouses) {
      return warehouses.map(w => ({
        warehouseCode: w.code,
        warehouseName: w.name,
        inStock: w.inStock,
      }));
    }
    return fetchedWarehouses || [];
  }, [warehouses, fetchedWarehouses]);

  // Debounce dropdown opening
  React.useEffect(() => {
    if (searchText.length > 0) {
      const timer = setTimeout(() => {
        setShowDropdown(true);
      }, SEARCH_DEBOUNCE_MS);

      return () => clearTimeout(timer);
    } else {
      setShowDropdown(false);
    }
  }, [searchText]);

  // Filter warehouses based on search text
  const filteredWarehouses = useMemo(() => {
    if (!allWarehouses) {
      return [];
    }
    
    // If search is empty, return empty array
    if (searchText.length === 0) {
      return [];
    }
    
    // If search is "*", return all warehouses
    if (searchText === '*') {
      return allWarehouses;
    }
    
    const lowerSearch = searchText.toLowerCase();
    return allWarehouses.filter((warehouse: any) => 
      warehouse.warehouseCode.toLowerCase().includes(lowerSearch)
    );
  }, [allWarehouses, searchText]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSelectedWarehouse(null);
    onClear();
    
    // Close dropdown immediately if text is empty
    if (text.length === 0) {
      setShowDropdown(false);
    }
  };

  const handleSelectWarehouse = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setSearchText('');
    setShowDropdown(false);
    // Convert to Warehouse format expected by parent
    onSelectWarehouse({
      warehouseCode: warehouse.warehouseCode,
    } as Warehouse);
  };

  const displayValue = selectedWarehouse 
    ? selectedWarehouse.warehouseCode
    : value || searchText;

  const hasValue = selectedWarehouse || value;
  const isEditable = !selectedWarehouse && !value;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            hasValue && styles.inputSelected,
          ]}
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          editable={isEditable}
        />
        
        {hasValue && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedWarehouse(null);
              setSearchText('');
              onClear();
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}

        {isLoading && (
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary} 
            style={styles.loader}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown */}
      <Modal
        visible={showDropdown && filteredWarehouses.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                {filteredWarehouses.length} almacén{filteredWarehouses.length !== 1 ? 'es' : ''} disponible{filteredWarehouses.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <FlatList
              data={filteredWarehouses}
              keyExtractor={(item) => item.warehouseCode}
              renderItem={({ item }) => {
                const hasStock = (item as any).inStock === undefined || (item as any).inStock > 0;
                return (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      !hasStock && styles.dropdownItemDisabled,
                    ]}
                    onPress={() => hasStock && handleSelectWarehouse(item)}
                    disabled={!hasStock}
                  >
                    <View style={styles.warehouseItemContent}>
                      <Text style={[
                        styles.warehouseCode,
                        !hasStock && styles.warehouseCodeDisabled,
                      ]}>
                        {item.warehouseCode}
                      </Text>
                      {(item as any).inStock !== undefined && (
                        <Text style={[
                          styles.stockText,
                          !hasStock && styles.stockTextDisabled,
                        ]}>
                          Stock: {(item as any).inStock}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputSelected: {
    borderColor: theme.colors.success,
    backgroundColor: '#f0fdf4',
  },
  clearButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 12,
    padding: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  loader: {
    position: 'absolute',
    right: theme.spacing.md,
    top: 14,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '90%',
    maxHeight: 400,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  dropdown: {
    maxHeight: 350,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownItemDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
  },
  warehouseItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warehouseCode: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  warehouseCodeDisabled: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stockText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  stockTextDisabled: {
    color: theme.colors.error,
  },
});
