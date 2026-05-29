export enum ConditionalOperator {
  EQUALS       = 'EQUALS',
  NOT_EQUALS   = 'NOT_EQUALS',
  CONTAINS     = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN    = 'LESS_THAN',
  IS_EMPTY     = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
}

export enum ConditionalAction {
  SHOW      = 'SHOW',
  HIDE      = 'HIDE',
  REQUIRE   = 'REQUIRE',
  UNREQUIRE = 'UNREQUIRE',
}