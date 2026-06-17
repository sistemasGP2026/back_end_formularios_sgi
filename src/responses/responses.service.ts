import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FormResponse, ResponseDocument, ResponseStatus } from './schemas/response.schema';
import { CreateResponseDto } from './dto/create-response.dto';
import { Form, FormDocument, FormField } from 'src/forms/schema/form.schema';
import { fieldValidators } from './validators/field.validators';
import { ruleValidators } from './validators/rule.validators';
import { UsersService } from 'src/users/users.service';
import { IUserRequest } from './dto/user.request';
import { User } from 'src/users/schema/user.schema';
import { FormsService } from 'src/forms/forms.service';
import { UserRole } from 'src/common';
import { ApproveResponseDto } from './dto/approve-response.dto';

type AnswerMap = Map<string, unknown>;
type ActiveFields = Set<string>;

@Injectable()
export class ResponsesService {
  constructor(
    @InjectModel(FormResponse.name)
    private readonly responseModel: Model<ResponseDocument>,
    private readonly userService: UsersService,
    private readonly formService: FormsService,
    @InjectModel(Form.name)
    private readonly formModel: Model<FormDocument>,
  ) { }

  async getResponsesByFormCode(codeForm: string) {
    return await this.responseModel.find({ formCode: codeForm }).lean().exec();
  }

  async getResponseDetailsById(response_id: string) {
    return await this.responseModel.findById(response_id).lean().exec();
  }

  async createResponse(dto: CreateResponseDto, userRequest: IUserRequest, form: FormDocument): Promise<ResponseDocument> {
    // Verificar duplicados
    await this.checkDuplicates(form, dto, userRequest);

    // Construir mapa de respuestas — keys = field.name
    const answerMap = this.buildAnswerMap(dto.data);

    // Resolver campos activos según lógica condicional
    const activeFields = this.resolveActiveFields(form.fields, answerMap);

    // Validar respuestas contra definición del formulario
    this.validateAnswers(form.fields, answerMap, activeFields);

    // Construir data final — solo campos activos
    const data = this.buildDataRecord(answerMap, activeFields, form.fields);

    const user: User = await this.userService.findUserById(userRequest.id);

    // Determinar status según configuración del formulario
    const status = form.settings?.requiresApproval
      ? ResponseStatus.PENDING
      : ResponseStatus.APPROVED;

    // Persistir
    return this.responseModel.create({
      formId: form._id,
      formCode: form.code,
      filledBy: {
        userId: user._id ?? null,
        fullName: user?.fullName ?? dto.filledBy?.fullName ?? '',
        email: user?.email ?? dto.filledBy?.email ?? '',
      },
      submittedAt: new Date(),
      data,
      status,
      approval: {
        approvedBy: null,
        approverName: null,
        approverUsername: null,
        approvedAt: null,
        rejectionReason: null,
      },
      deleted: false,
    });
  }

  //duplicados
  private async checkDuplicates(
    form: FormDocument,
    dto: CreateResponseDto,
    user: any
  ): Promise<void> {
    if (!form.settings?.preventDuplicates) return;

    const criteriaMap: Record<string, Record<string, unknown> | null> = {
      userId: user?._id
        ? { formId: form._id, 'filledBy.userId': user._id }
        : null,
      email: (user?.email ?? dto.filledBy?.email)
        ? {
          formId: form._id,
          'filledBy.email': (user?.email ?? dto.filledBy?.email).toLowerCase(),
        }
        : null,
    };

    const query = criteriaMap[form.settings.duplicateBy ?? ''];
    if (!query) return;

    const existing = await this.responseModel.findOne(query).exec();
    if (existing) {
      throw new BadRequestException(
        'Ya existe una respuesta registrada para este formulario',
      );
    }
  }

  //mapa de respuestas

  private buildAnswerMap(data: Record<string, unknown>): AnswerMap {
    return new Map(Object.entries(data)); // keys = field.name
  }

  //lógica condicional

  private resolveActiveFields(
    fields: FormField[],
    answerMap: AnswerMap
  ): ActiveFields {
    const activeFields = new Set<string>();
    const idToName = new Map(fields.map(f => [f.id, f.name])); // id → name

    for (const field of fields) {
      if (!field.conditionalRules?.length) {
        if (!field.hidden) activeFields.add(field.id);
        continue;
      }
      if (this.evaluateConditionalRules(field, answerMap, idToName)) {
        activeFields.add(field.id);
      }
    }

    return activeFields;
  }

  private evaluateConditionalRules(
    field: FormField,
    answerMap: AnswerMap,
    idToName: Map<string, string>
  ): boolean {
    let hasShowRule = false;
    let showTriggered = false;
    let hideTriggered = false;

    for (const rule of field.conditionalRules ?? []) {
      const triggerFieldName = idToName.get(rule.triggerFieldId);
      const conditionMet = this.evaluateCondition(
        answerMap.get(triggerFieldName ?? rule.triggerFieldId), // busca por name
        rule.operator,
        rule.expectedValue,
      );

      if (rule.action === 'SHOW') {
        hasShowRule = true;
        if (conditionMet) showTriggered = true;
      }

      if (rule.action === 'HIDE' && conditionMet) {
        hideTriggered = true;
      }
    }

    if (hideTriggered) return false;
    if (hasShowRule) return showTriggered;
    return !field.hidden;
  }

  private evaluateCondition(
    actual: unknown,
    operator: string,
    expected: string | null
  ): boolean {
    const a = String(actual ?? '').trim().toLowerCase();
    const e = String(expected ?? '').trim().toLowerCase();

    switch (operator) {
      case 'EQUALS': return a === e;
      case 'NOT_EQUALS': return a !== e;
      case 'CONTAINS': return a.includes(e);
      case 'NOT_CONTAINS': return !a.includes(e);
      case 'GREATER_THAN': return Number(actual) > Number(expected);
      case 'LESS_THAN': return Number(actual) < Number(expected);
      case 'GREATER_THAN_OR_EQUAL': return Number(actual) >= Number(expected);
      case 'LESS_THAN_OR_EQUAL': return Number(actual) <= Number(expected);
      case 'IS_EMPTY': return !a;
      case 'IS_NOT_EMPTY': return !!a;
      default: return false;
    }
  }

  //validación de respuestas

  private validateAnswers(
    fields: FormField[],
    answerMap: AnswerMap,
    activeFields: ActiveFields
  ): void {
    for (const field of fields) {
      if (!activeFields.has(field.id)) continue;

      const value = answerMap.get(field.name); // ← field.name

      if (field.required && this.isEmpty(value, field.type)) {
        throw new BadRequestException(
          `El campo "${field.label}" es obligatorio`,
        );
      }

      if (this.isEmpty(value, field.type)) continue;

      const typeValidator = fieldValidators[field.type];
      if (typeValidator) typeValidator(field, value);

      for (const rule of field.validations ?? []) {
        const ruleValidator = ruleValidators[rule.type];
        if (ruleValidator) {
          ruleValidator(value, rule.value, rule.errorMessage, field.label);
        }
      }
    }
  }

  private isEmpty(value: unknown, fieldType: string): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && !value.trim()) return true;
    if (
      ['checkbox', 'checklist-table', 'file'].includes(fieldType) &&
      Array.isArray(value) &&
      value.length === 0
    ) return true;
    return false;
  }

  //construcción del record final

  private buildDataRecord(
    answerMap: Map<string, unknown>,
    activeFields: ActiveFields,
    allFields: FormField[],
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const field of allFields) {
      if (activeFields.has(field.id) && answerMap.has(field.name)) { // ← field.name
        data[field.name] = answerMap.get(field.name);
      }
    }
    return data;
  }

  // responses.service.ts
  async getPendingUsers(formCode: string) {
    const form = await this.formService.getFormByCode(formCode);

    if (!form) throw new NotFoundException(`Formulario con codigo: ${formCode}, no encontrado`);

    const responded = await this.responseModel
      .find({ formCode })
      .distinct('filledBy.userId');

    const respondedIds = responded.map(id => id.toString());

    const pending = form.permissions.users.filter(
      u => !respondedIds.includes(u.userId?.toString())
    );

    return pending.map(u => ({
      userId: u.userId,
      name: u.name,
      username: u.username,
      email: u.email,
    }));

  }

  async getMyResponses(userId: string) {
    return await this.responseModel
      .find({ 'filledBy.userId': userId, deleted: false })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();
  }


  async deleteResponse(id: string): Promise<void> {
    const response = await this.responseModel.findById(id);
    if (!response) throw new NotFoundException(`Respuesta no encontrada`);

    await this.responseModel.findByIdAndUpdate(
      id,
      { $set: { deleted: true } },
      { returnDocument: 'after' }
    ).exec();
  }

  async deleteResponsesByForm(formCode: string): Promise<void> {
    await this.responseModel.updateMany(
      { formCode, deleted: false },
      { $set: { deleted: true } }
    ).exec();
  }

  // Solo las del approver — para APPROVER
  async getPendingByApprover(userId: string) {
    const forms = await this.formModel.find({
      deleted: false,
      'settings.requiresApproval': true,
      'permissions.approvers.userId': new Types.ObjectId(userId),
    }).select('code').lean().exec();

    const codes = forms.map((f: any) => f.code);
    if (codes.length === 0) return [];

    return this.responseModel
      .find({ deleted: false, status: ResponseStatus.PENDING, formCode: { $in: codes } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getAllPending() {
    return this.responseModel
      .find({ deleted: false, status: ResponseStatus.PENDING })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async approveResponse(
    responseId: string,
    dto: ApproveResponseDto,
    approverId: string,
    approverName: string,
    approverUsername: string,
  ) {
    const response = await this.responseModel.findById(responseId);
    if (!response) throw new NotFoundException('Respuesta no encontrada');

    if (response.status !== ResponseStatus.PENDING) {
      throw new BadRequestException('Esta respuesta ya fue procesada');
    }

    if (dto.status === ResponseStatus.REJECTED && !dto.rejectionReason?.trim()) {
      throw new BadRequestException('Debes ingresar una razón de rechazo');
    }

    return this.responseModel.findByIdAndUpdate(
      responseId,
      {
        $set: {
          status: dto.status,
          'approval.approvedBy': new Types.ObjectId(approverId),
          'approval.approverName': approverName,
          'approval.approverUsername': approverUsername,
          'approval.approvedAt': new Date(),
          'approval.rejectionReason': dto.rejectionReason ?? null,
        },
      },
      { returnDocument: 'after' }
    ).lean().exec();
  }


}