// Presentation - Item Search Input Component
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
import { useItemSearch } from '../hooks/useItemSearch';
import { Item } from '../../domain/entities/item.entity';

interface ItemSearchInputProps {
  value: string;
  onSelectItem: (item: Item) => void;
  onClear: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const ItemSearchInput: React.FC<ItemSearchInputProps> = ({
  value,
  onSelectItem,
  onClear,
  placeholder = 'Buscar producto...',
  label,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { items, isSearching } = useItemSearch(searchText, 5);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSelectedItem(null);
    onClear();
    
    if (text.length >= 3) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setSearchText(item.itemCode);
    setShowDropdown(false);
    onSelectItem(item);
  };

  const displayValue = selectedItem 
    ? selectedItem.itemCode
    : value || searchText;

  const hasValue = selectedItem || value;

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
          editable={!selectedItem && !value}
        />
        
        {hasValue && (
          <TouchableOpacity 
            onPress={() => {
              setSelectedItem(null);
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
        visible={showDropdown && items.length > 0}
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
              data={items}
              keyExtractor={(item) => item.itemCode}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleSelectItem(item)}
                >
                  <Text style={styles.itemCode}>{item.itemCode}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.itemName || 'Sin descripción'}
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
  itemCode: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
