// Presentation - Advanced Product Output Tab
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';

interface AdvancedProductOutputTabProps {
  advancedProductId: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdvancedProductOutputTab: React.FC<AdvancedProductOutputTabProps> = ({
  advancedProductId,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleCreateOutput = () => {
    navigation.navigate('CreateConsumer');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.placeholderText}>
            Aquí se mostrarán las salidas de mercancías asociadas
          </Text>
        </Card>
      </ScrollView>

      <TouchableOpacity onPress={handleCreateOutput} style={styles.fab}>
        <Text style={styles.fabIcon}>📋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: theme.colors.background,
  },
});
