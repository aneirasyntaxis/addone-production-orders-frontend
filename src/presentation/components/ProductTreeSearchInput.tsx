// Presentation - Product Tree Search Input Component
import React, { useState } from 'react';
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
import { useProductTreeSearch } from '../hooks/useProductTreeSearch';
import { ProductTree } from '../../domain/entities/product-tree.entity';
import { SEARCH_MIN_CHARS } from '../../core/config/search.config';

interface ProductTreeSearchInputProps {
  value: string;
  onSelectProductTree: (productTree: ProductTree) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const ProductTreeSearchInput: React.FC<ProductTreeSearchInputProps> = ({
  value,
  onSelectProductTree,
  onClear,
  placeholder = 'Buscar producto...',
  label,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTree, setSelectedTree] = useState<ProductTree | null>(null);
  const [stockInfo, setStockInfo] = useState<{ [treeCode: string]: string }>({});

  const { productTrees, isSearching } = useProductTreeSearch(searchText, 10);

  // Load stock information for each product tree
  React.useEffect(() => {
    if (productTrees.length > 0) {
      const newStockInfo: { [treeCode: string]: string } = {};
      
      productTrees.forEach((tree) => {
        // Usar itemWarehouseInfoCollection del ProductTree si está disponible
        if (tree.itemWarehouseInfoCollection && tree.itemWarehouseInfoCollection.length > 0) {
          const warehousesWithStock = tree.itemWarehouseInfoCollection
            .filter(wh => (wh.inStock ?? 0) > 0)
            .map(wh => `${wh.warehouseCode} (${wh.inStock})`)
            .join(' - ');
          
          if (warehousesWithStock) {
            newStockInfo[tree.treeCode] = warehousesWithStock;
          }
        }
      });
      
      setStockInfo(newStockInfo);
    }
  }, [productTrees]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSelectedTree(null);
    onClear();
    // El dropdown se controlará automáticamente basado en si hay resultados
  };

  // Auto-open dropdown when search results are available
  React.useEffect(() => {
    if (searchText.length >= SEARCH_MIN_CHARS && productTrees.length > 0 && !selectedTree) {
      setShowDropdown(true);
    } else if (searchText.length < SEARCH_MIN_CHARS) {
      setShowDropdown(false);
    }
  }, [productTrees, searchText, selectedTree]);

  const handleSelectTree = (tree: ProductTree) => {
    setSelectedTree(tree);
    setSearchText('');
    setShowDropdown(false);
    onSelectProductTree(tree);
  };

  const displayValue = selectedTree 
    ? `${selectedTree.treeCode} - ${selectedTree.productDescription || ''}` 
    : searchText;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            selectedTree && styles.inputSelected,
          ]}
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          editable={!selectedTree}
        />
        
        {selectedTree && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedTree(null);
              setSearchText('');
              onClear();
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}

        {isSearching && (
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
        visible={showDropdown && productTrees.length > 0}
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
            <FlatList
              data={productTrees}
              keyExtractor={(tree) => tree.treeCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectTree(item)}
                >
                  <Text style={styles.treeCode}>{item.treeCode}</Text>
                  <Text style={styles.treeDescription} numberOfLines={1}>
                    {item.productDescription || 'Sin descripción'}
                  </Text>
                  {stockInfo[item.treeCode] && (
                    <Text style={styles.stockInfo}>
                      Stock: {stockInfo[item.treeCode]}
                    </Text>
                  )}
                  <Text style={styles.treeInfo}>
                    {item.productTreeLines.length} materiales
                  </Text>
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
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
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
    backgroundColor: theme.colors.background,
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
    fontSize: theme.fontSize.xs,
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
    maxHeight: 300,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdown: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  treeCode: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  treeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  stockInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginBottom: 2,
    fontWeight: '500',
  },
  treeInfo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
});
