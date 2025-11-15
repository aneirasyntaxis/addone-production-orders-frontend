// Presentation - DatePicker Component
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme/theme';

interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = 'Seleccionar fecha',
  mode = 'date',
}) => {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      onChange(selectedDate);
      if (Platform.OS === 'ios') {
        setShow(false);
      }
    } else if (event.type === 'dismissed') {
      setShow(false);
    }
  };

  const handleWebInputChange = (text: string) => {
    // Format: YYYY-MM-DD
    if (text) {
      const date = new Date(text + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const displayValue = value ? formatDate(value) : '';

  // Web implementation using native HTML5 date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        
        <input
          type="date"
          value={displayValue}
          onChange={(e) => handleWebInputChange(e.target.value)}
          placeholder={placeholder}
          style={{
            height: 48,
            width: '100%',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: error ? theme.colors.error : value ? theme.colors.primary : theme.colors.border,
            borderRadius: theme.borderRadius.md,
            paddingLeft: theme.spacing.md,
            paddingRight: theme.spacing.md,
            fontSize: theme.fontSize.md,
            fontFamily: 'inherit',
            color: theme.colors.text,
            backgroundColor: theme.colors.background,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Native implementation (iOS/Android)
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          value && styles.inputSelected,
        ]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.inputText,
            !value && styles.placeholderText,
          ]}
        >
          {displayValue || placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
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
  input: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputSelected: {
    borderColor: theme.colors.primary,
  },
  inputText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  icon: {
    fontSize: 20,
  },
  webInput: {
    paddingVertical: 0,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
