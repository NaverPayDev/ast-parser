import {ImportDeclaration, ProgramStatement} from '@typescript-eslint/types/dist/generated/ast-spec'
import {AST_NODE_TYPES} from '@typescript-eslint/typescript-estree'

import {ComponentAST} from '../types/ast'

export function getImportDeclarations(node: ComponentAST) {
    let i = 0
    const importDeclarations: ImportDeclaration[] = []
    let iterateNode: ProgramStatement

    while ((iterateNode = node.body[i++])?.type === AST_NODE_TYPES.ImportDeclaration) {
        importDeclarations.push(iterateNode)
    }

    return importDeclarations
}

export function getExportDefaultDeclaration(node: ComponentAST) {
    const [exportDefaultDeclaration] = node.body.filter(({type}) => type === AST_NODE_TYPES.ExportDefaultDeclaration)

    return exportDefaultDeclaration
}
