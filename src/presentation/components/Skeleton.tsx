// Presentation - Skeleton Loader Component
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Skeleton width={120} height={24} style={styles.mb} />
          <Skeleton width={80} height={16} />
        </View>
        <Skeleton width={60} height={20} borderRadius={theme.borderRadius.sm} />
      </View>
      <View style={styles.content}>
        <Skeleton width="100%" height={16} style={styles.mb} />
        <Skeleton width="100%" height={16} style={styles.mb} />
        <Skeleton width="80%" height={16} style={styles.mb} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
};

export const SkeletonDetail: React.FC = () => {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.card}>
        <Skeleton width={150} height={20} style={styles.mbLg} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={100} height={14} />
            <Skeleton width={120} height={14} />
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Skeleton width={150} height={20} style={styles.mbLg} />
        {[1, 2].map((i) => (
          <View key={i} style={styles.lineCard}>
            <Skeleton width={80} height={16} style={styles.mb} />
            <Skeleton width="100%" height={14} style={styles.mb} />
            <Skeleton width="90%" height={14} style={styles.mb} />
            <Skeleton width="70%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  content: {
    gap: theme.spacing.sm,
  },
  mb: {
    marginBottom: theme.spacing.sm,
  },
  mbLg: {
    marginBottom: theme.spacing.md,
  },
  detailContainer: {
    padding: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  lineCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
