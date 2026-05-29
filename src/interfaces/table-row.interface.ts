/**
 * Fila predefinida por el creador del formulario
 * para campos CHECKLIST_TABLE e INVENTORY_TABLE.
 *
 * Ejemplo:
 *   { id: 'row_1', label: 'Gasas limpias', unitLabel: 'Paquete × 20', minQuantity: 1 }
 */
export interface ITableRow {
  id: string;
  label: string;
  order: number;
  unitLabel?: string;
  minQuantity?: number;
  meta?: Record<string, unknown>;
}