import {TSESTreeOptions, parse} from '@typescript-eslint/typescript-estree'

import {ComponentAST} from './types/ast'

export default function parseToAST(code: string, options?: TSESTreeOptions) {
    const ast = parse(code, {
        range: true,
        jsx: true,
        comment: true,
        ...options,
    })

    return ast as ComponentAST
}
