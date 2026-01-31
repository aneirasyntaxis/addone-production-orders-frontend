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

interface WarehouseSearchInputProps {
  value: string;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const WarehouseSearchInput: React.FC<WarehouseSearchInputProps> = ({
  value,
  onSelectWarehouse,
  onClear,
  placeholder = 'Buscar almacén...',
  label,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const { data: allWarehouses, isLoading } = useWarehouses();

  // Debounce dropdown opening
  React.useEffect(() => {
    if (searchText.length > 0) {
      const timer = setTimeout(() => {
        setShowDropdown(true);
      }, 700);

      return () => clearTimeout(timer);
    } else {
      setShowDropdown(false);
    }
  }, [searchText]);

  // Filter warehouses based on search text
  const filteredWarehouses = useMemo(() => {
    if (!allWarehouses || searchText.length === 0) {
      return allWarehouses || [];
    }
    
    const lowerSearch = searchText.toLowerCase();
    return allWarehouses.filter((warehouse: Warehouse) => 
      warehouse.warehouseCode.toLowerCase().includes(lowerSearch)
    );
  }, [allWarehouses, searchText]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSelectedWarehouse(null);
    onClear();
  };

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setSearchText('');
    setShowDropdown(false);
    onSelectWarehouse(warehouse);
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectWarehouse(item)}
                >
                  <Text style={styles.warehouseCode}>{item.warehouseCode}</Text>
                </TouchableOpacity>
              )}
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
  warehouseCode: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
