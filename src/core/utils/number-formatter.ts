// Core - Number Formatter Utilities

/**
 * Formatea un número con separador de miles (punto) sin decimales
 * @param value - Valor numérico a formatear
 * @returns String formateado con punto como separador de miles
 * @example formatThousands(1000) -> "1.000"
 * @example formatThousands(1500000) -> "1.500.000"
 */
export const formatThousands = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  // Redondear a entero y formatear con punto como separador de miles
  return Math.round(numValue).toLocaleString('es-ES', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formatea un número con separador de miles (punto) y decimales (coma)
 * @param value - Valor numérico a formatear
 * @param decimals - Cantidad de decimales a mostrar (default: 2)
 * @returns String formateado con punto como separador de miles y coma para decimales
 * @example formatNumber(1000.50, 2) -> "1.000,50"
 * @example formatNumber(1500000.75, 2) -> "1.500.000,75"
 */
export const formatNumber = (
  value: number | string | undefined | null,
  decimals: number = 2
): string => {
  if (value === undefined || value === null || value === '') {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  return numValue.toLocaleString('es-ES', {
    useGrouping: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
