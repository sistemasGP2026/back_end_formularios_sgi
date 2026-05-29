import { BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';

type FieldValidator = (field: any, value: any) => void;

export const fieldValidators: Record<string, FieldValidator> = {

  text: (field, value) => {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un texto pero recibió: ${typeof value}`,
      );
    }
  },

  textarea: (field, value) => {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un texto pero recibió: ${typeof value}`,
      );
    }
  },

  email: (field, value) => {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un email pero recibió: ${typeof value}`,
      );
    }
    if (!isEmail(value, { require_tld: true })) {
      throw new BadRequestException(
        `El campo "${field.label}" contiene un valor inválido: "${value}"}.` 
      );
    }
  },

  number: (field, value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un número pero recibió: "${value}" (${typeof value})`,
      );
    }
  },

  select: (field, value) => {
    const validValues = (field.options ?? []).map((o: any) => o.value);
    if (!validValues.includes(value)) {
      throw new BadRequestException(
        `El campo "${field.label}" recibió la opción "${value}" que no es válida. ` +
        `Opciones permitidas: ${validValues.map((v: string) => `"${v}"`).join(', ')}`,
      );
    }
  },

  radio: (field, value) => {
    const validValues = (field.options ?? []).map((o: any) => o.value);
    if (!validValues.includes(value)) {
      throw new BadRequestException(
        `El campo "${field.label}" recibió la opción "${value}" que no es válida. ` +
        `Opciones permitidas: ${validValues.map((v: string) => `"${v}"`).join(', ')}`,
      );
    }
  },

  checkbox: (field, value) => {
    if (!Array.isArray(value)) {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un arreglo de opciones ` +
        `pero recibió: ${typeof value}`,
      );
    }

    const validValues  = (field.options ?? []).map((o: any) => o.value);
    const invalidOpts  = (value as string[]).filter((v) => !validValues.includes(v));

    if (invalidOpts.length) {
      throw new BadRequestException(
        `El campo "${field.label}" contiene opciones inválidas: ` +
        `${invalidOpts.map((v) => `"${v}"`).join(', ')}. ` +
        `Opciones permitidas: ${validValues.map((v: string) => `"${v}"`).join(', ')}`,
      );
    }
  },

  file: (field, value) => {
    const files = Array.isArray(value) ? value : [value];

    files.forEach((file, index) => {
      const position = files.length > 1 ? ` (archivo ${index + 1})` : '';

      if (typeof file !== 'object' || file === null) {
        throw new BadRequestException(
          `El campo "${field.label}"${position} esperaba un objeto de archivo ` +
          `pero recibió: ${typeof file}`,
        );
      }

      if (typeof file?.fileName !== 'string' || !file.fileName.trim()) {
        throw new BadRequestException(
          `El campo "${field.label}"${position} no tiene un nombre de archivo válido. ` +
          `Se esperaba la propiedad "fileName" como texto`,
        );
      }

      if (typeof file?.fileUrl !== 'string' || !file.fileUrl.trim()) {
        throw new BadRequestException(
          `El campo "${field.label}"${position}: el archivo "${file.fileName}" ` +
          `no tiene una URL válida. Se esperaba la propiedad "fileUrl" como texto`,
        );
      }
    });
  },

  'checklist-table': (field, value) => {
    if (!Array.isArray(value)) {
      throw new BadRequestException(
        `El campo "${field.label}" esperaba un arreglo de filas ` +
        `pero recibió: ${typeof value}`,
      );
    }

    const validRowIds     = new Set((field.rows    ?? []).map((r: any) => r.id));
    const allRowLabels    = (field.rows ?? []).reduce((acc: any, r: any) => {
      acc[r.id] = r.label;
      return acc;
    }, {});
    const requiredColumns = (field.columns ?? []).filter((c: any) => c.required);

    (value as Record<string, unknown>[]).forEach((row, index) => {
      const rowNumber = index + 1;

      if (!row['rowId']) {
        throw new BadRequestException(
          `El campo "${field.label}" — la fila ${rowNumber} no tiene "rowId"`,
        );
      }

      const rowId    = String(row['rowId']);
      const rowLabel = allRowLabels[rowId] ?? rowId;

      if (!validRowIds.has(rowId)) {
        throw new BadRequestException(
          `El campo "${field.label}" — la fila "${rowId}" no existe ` +
          `en la definición del formulario`,
        );
      }

      for (const col of requiredColumns) {
        const colValue = row[col.key];
        if (colValue === null || colValue === undefined || colValue === '') {
          throw new BadRequestException(
            `El campo "${field.label}" — la columna "${col.label}" ` +
            `es obligatoria en la fila "${rowLabel}"`,
          );
        }
      }
    });
  },
};