import { ConditionalAction, ConditionalOperator } from "src/common";

export interface IConditionalRule {
  triggerFieldId: string;
  operator: ConditionalOperator;
  expectedValue?: string;
  action: ConditionalAction;

}