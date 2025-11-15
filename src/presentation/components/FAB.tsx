// Presentation - FAB (Floating Action Button) Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme/theme';

interface FABProps {
  onPress: () => void;
  icon?: string;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({ onPress, icon = '+', style }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 36,
    color: theme.colors.primaryForeground,
    fontWeight: '200',
    lineHeight: 36,
    includeFontPadding: false,
    textAlign: 'center',
    marginTop: -8,
  },
});
