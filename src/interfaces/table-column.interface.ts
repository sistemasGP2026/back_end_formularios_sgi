import { FieldType } from "src/common";


/**
 * Define una columna dentro de un campo de tipo
 * INVENTORY_TABLE o CHECKLIST_TABLE.
 *
 * Ejemplo — inventario botiquín:
 *   { key: 'cantidadReal',  label: 'Cant. real',  inputType: FieldType.NUMBER, required: true  }
 *   { key: 'vencimiento',   label: 'Vencimiento', inputType: FieldType.DATE,   required: false }
 *   { key: 'estado',        label: 'Estado',      inputType: FieldType.SELECT, required: true  }
 */
export interface ITableColumn {
  key: string;
  label: string;
  inputType: FieldType;
  required: boolean;
  order: number;
  options?: Array<{ label: string; value: string }>;
  width?: string;
}
