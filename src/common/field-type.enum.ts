export enum FieldType {
  // Texto
  TEXT     = 'text',
  TEXTAREA = 'textarea',
  EMAIL    = 'email',
  URL      = 'url',
  PHONE    = 'phone',

  // Numérico
  NUMBER = 'number',
  RATING = 'rating',

  // Fecha y hora
  DATE     = 'date',
  TIME     = 'time',
  DATETIME = 'datetime',

  // Selección simple
  SELECT = 'select',
  RADIO  = 'radio',

  // Selección múltiple
  CHECKBOX = 'checkbox',

  // Especiales
  SIGNATURE       = 'signature',
  FILE            = 'file',
  CHECKLIST_TABLE = 'checklist-table',
  INVENTORY_TABLE = 'inventory-table',

  // Presentación — no capturan datos
  SECTION_TITLE = 'section-title',
  PARAGRAPH     = 'paragraph',
}