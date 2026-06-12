import { Types } from 'mongoose';
import {
  CreateFormDto, FieldOptionDto, FormFieldDto,
  FormSettingsDto, TableColumnDto, TableRowDto,
} from 'src/forms/dto/create-form.dto';
import { Form } from 'src/forms/schema/form.schema';
import { UserDocument } from 'src/users/schema/user.schema';

export class FormMapper {

  static toEntity(
    dto: CreateFormDto,
    creator: UserDocument,
    usersMap: Map<string, UserDocument> = new Map(),
  ): Partial<Form> {
    return {
      code: dto.code.toUpperCase(),
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category,
      version: dto.version ?? 1,
      documentDate: dto.documentDate ?? null,
      accessType: dto.accessType ?? ('RESTRICTED' as any),
      settings: FormMapper.mapSettings(dto.settings),
      permissions: FormMapper.mapPermissions(dto.permissions, usersMap),
      createdBy: FormMapper.mapCreatedBy(creator),
      sections: FormMapper.mapSections(dto.sections),
      fields: FormMapper.mapFields(dto.fields),
      deleted: false,
    };
  }

  private static mapCreatedBy(user: UserDocument) {
    return {
      userId: new Types.ObjectId(user._id.toString()),
      name: user.fullName,
      username: user.username,
      email: user.email,
    };
  }

  private static mapSettings(dto?: FormSettingsDto) {
    return {
      allowDraft: dto?.allowDraft ?? false,
      requiresApproval: dto?.requiresApproval ?? false,
      showCompliance: dto?.showCompliance ?? false,
      preventDuplicates: dto?.preventDuplicates ?? false,
      duplicateBy: dto?.duplicateBy ?? null,
      requiresSede: dto?.requiresSede ?? false,
      requiresReviewSignature: dto?.requiresReviewSignature ?? false,
    };
  }

  private static mapPermissions(
    dto: CreateFormDto['permissions'],
    usersMap: Map<string, UserDocument>,
  ) {
    return {
      users: (dto?.users ?? []).map((p) => {
        const user = usersMap.get(p.username);
        if (!user) {
          throw new Error(`Usuario '${p.username}' no encontrado en usersMap.`);
        }
        return {
          userId: new Types.ObjectId(user._id.toString()),
          name: user.fullName,
          username: user.username,
          email: user.email,
        };
      }),
      approvers: [],
    };
  }

  private static mapSections(sections?: CreateFormDto['sections']) {
    return (sections ?? []).map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
      order: s.order ?? 0,
    }));
  }

  private static mapFields(fields?: FormFieldDto[]) {
    return (fields ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      label: f.label,
      type: f.type,
      sectionId: f.sectionId,
      required: f.required ?? false,
      readOnly: f.readOnly ?? false,
      hidden: f.hidden ?? false,
      placeholder: f.placeholder ?? null,
      helpText: f.helpText ?? null,
      minLength: f.minLength ?? null,
      maxLength: f.maxLength ?? null,
      pattern: f.pattern ?? null,
      min: f.min ?? null,
      max: f.max ?? null,
      options: FormMapper.mapOptions(f.options),
      rows: FormMapper.mapRows(f.rows),
      columns: FormMapper.mapColumns(f.columns),
      validations: FormMapper.mapValidations(f.validations),
      conditionalRules: FormMapper.mapConditionalRules(f.conditionalRules),
      order: f.order ?? 0,
      dataSource: f.dataSource ?? null,
      weight: f.weight ?? null,
      maxScore: f.maxScore ?? null,
      formula: f.formula ?? null,
      sourceField: f.sourceField ?? null,
      thresholds: (f.thresholds ?? []).map(t => ({
        min: t.min,
        max: t.max,
        label: t.label,
        color: t.color ?? null, // ← fuerza null
      })),
    }));
  }

  private static mapOptions(options?: FieldOptionDto[]) {
    return (options ?? []).map((o) => ({
      label: o.label,
      value: o.value,
      isDefault: o.isDefault ?? false,
      order: o.order ?? 0,
    }));
  }

  private static mapRows(rows?: TableRowDto[]) {
    return (rows ?? []).map((r) => ({
      id: r.id,
      label: r.label,
      order: r.order ?? 0,
      unitLabel: r.unitLabel ?? undefined,
      minQuantity: r.minQuantity ?? undefined,
    }));
  }

  private static mapColumns(columns?: TableColumnDto[]) {
    return (columns ?? []).map((c) => ({
      key: c.key,
      label: c.label,
      inputType: c.inputType,
      required: c.required ?? false,
      order: c.order ?? 0,
      options: FormMapper.mapOptions(c.options),
      width: c.width ?? undefined,
    }));
  }

  private static mapValidations(validations?: FormFieldDto['validations']) {
    return (validations ?? []).map((v) => ({
      type: v.type,
      value: v.value ?? null,
      errorMessage: v.errorMessage,
    }));
  }

  private static mapConditionalRules(rules?: FormFieldDto['conditionalRules']) {
    return (rules ?? []).map((r) => ({
      triggerFieldId: r.triggerFieldId,
      operator: r.operator,
      expectedValue: r.expectedValue ?? null,
      action: r.action,
    }));
  }
}