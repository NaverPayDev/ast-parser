import type {AST} from '@typescript-eslint/typescript-estree'

export type ComponentAST = AST<{
    range: true
    jsx: true
    comment: true
}>

export type PossibleObjectValue = string | number | bigint | boolean | RegExp | null
