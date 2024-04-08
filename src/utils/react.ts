import {AST_NODE_TYPES} from '@typescript-eslint/typescript-estree'
import type {
    FunctionDeclaration,
    VariableDeclaration,
    FunctionExpression,
    ArrowFunctionExpression,
    JSXElement,
    ReturnStatement,
    JSXOpeningElement,
    Parameter,
    Property,
    Identifier,
    ObjectExpression,
} from '@typescript-eslint/types/dist/generated/ast-spec'

import {ComponentAST, PossibleObjectValue} from '../types/ast'
import {PROPS_IDENTIFIER_NAME} from '../constants'

type ComponentTypeNode = FunctionDeclaration | VariableDeclaration

export function getReactComponentDeclaration(node: ComponentAST) {
    const [componentDeclaration] = node.body.filter((children) =>
        Object.values([AST_NODE_TYPES.FunctionDeclaration, AST_NODE_TYPES.VariableDeclaration]).includes(children.type),
    ) as unknown as ComponentTypeNode[]

    return componentDeclaration
}

function parseArrowFunctionJSXElement(arrowFunction: ArrowFunctionExpression, targetIdentifierName: string) {
    const body = arrowFunction.body

    // () => JSX.Element
    if (body.type === AST_NODE_TYPES.JSXElement) {
        return confirmOpeningElement(body.openingElement, targetIdentifierName)
            ? body
            : recursiveParseOpeningElement(body, targetIdentifierName)
    }
    // () => { return JSX.Element }
    else if (body.type === AST_NODE_TYPES.BlockStatement) {
        return parseFunctionExpressionJSXElement(arrowFunction, targetIdentifierName)
    }
}

function recursiveParseOpeningElement(jsxElement: JSXElement, targetIdentifierName: string) {
    const {children} = jsxElement

    const jsxChildrenElements = children.filter<JSXElement>(
        (childElement): childElement is JSXElement => childElement.type === AST_NODE_TYPES.JSXElement,
    )

    let targetJsxElement: JSXElement | undefined

    jsxChildrenElements.some((jsxChildrenElement) => {
        const {openingElement} = jsxChildrenElement
        if (confirmOpeningElement(openingElement, targetIdentifierName)) {
            targetJsxElement = jsxChildrenElement
            return true
        } else {
            targetJsxElement = recursiveParseOpeningElement(jsxChildrenElement, targetIdentifierName)
        }
        return false
    })

    return targetJsxElement
}

function confirmOpeningElement(openingElement: JSXOpeningElement, targetIdentifierName: string) {
    const {name} = openingElement

    return name.type === AST_NODE_TYPES.JSXIdentifier && name.name === targetIdentifierName
}

function parseFunctionExpressionJSXElement(
    functionExpression: FunctionExpression | FunctionDeclaration | ArrowFunctionExpression,
    targetIdentifierName: string,
) {
    if (functionExpression.body.type === AST_NODE_TYPES.BlockStatement) {
        const argument: JSXElement = functionExpression.body.body.find<ReturnStatement>(
            (statement): statement is ReturnStatement =>
                statement.type === AST_NODE_TYPES.ReturnStatement &&
                statement?.argument?.type === AST_NODE_TYPES.JSXElement,
        )?.argument as JSXElement

        return confirmOpeningElement(argument.openingElement, targetIdentifierName)
            ? argument
            : recursiveParseOpeningElement(argument, targetIdentifierName)
    }
}

export function getJSXElement(node: ComponentAST, targetIdentifierName: string) {
    /**
     * @todo SVGUniqueID 내부에 있는 아이들또한 검사 필요
     */
    const componentDeclaration = getReactComponentDeclaration(node)

    if (componentDeclaration.type === AST_NODE_TYPES.FunctionDeclaration) {
        return parseFunctionExpressionJSXElement(componentDeclaration, targetIdentifierName)
    } else if (componentDeclaration.type === AST_NODE_TYPES.VariableDeclaration) {
        const variableDeclarator = componentDeclaration.declarations[0].init

        if (!variableDeclarator) {
            return
        }

        // memo() 된 코드
        if (variableDeclarator.type === AST_NODE_TYPES.CallExpression) {
            const callExpressionArgument = variableDeclarator.arguments.find(
                ({type}) =>
                    type === AST_NODE_TYPES.ArrowFunctionExpression || type === AST_NODE_TYPES.FunctionExpression,
            )
            if (callExpressionArgument) {
                if (callExpressionArgument.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                    return parseArrowFunctionJSXElement(callExpressionArgument, targetIdentifierName)
                } else if (callExpressionArgument.type === AST_NODE_TYPES.FunctionExpression) {
                    return parseFunctionExpressionJSXElement(callExpressionArgument, targetIdentifierName)
                }
            }
        }
        // memo() 되지 않은 코드
        else if (variableDeclarator.type === AST_NODE_TYPES.ArrowFunctionExpression) {
            return parseArrowFunctionJSXElement(variableDeclarator, targetIdentifierName)
        }
    }
}

/**
 * @description 재귀적으로 중첩 구조 객체까지 파싱
 */
const parseObjectExpression = (objectExpression: ObjectExpression) => {
    const objectEntries: [string, PossibleObjectValue | Record<string, any>][] = objectExpression.properties
        .filter<Property>(
            (expression): expression is Property =>
                expression.type !== AST_NODE_TYPES.SpreadElement && expression.key.type === AST_NODE_TYPES.Identifier,
        )
        .map(({key, value}) => [
            (key as Identifier).name,
            value.type === AST_NODE_TYPES.Literal ? value.value : parseObjectExpression(value as ObjectExpression),
        ])

    return Object.fromEntries(objectEntries)
}

export const parsePropsDeclaration = (
    propsDeclaration: Parameter,
): Record<string, null | number | {[key in string]: any}> | typeof PROPS_IDENTIFIER_NAME | null => {
    if (!propsDeclaration) {
        return {}
    }
    // ({id = generateRandomString(), width = '100%', style = {stroke: '2px'}}: SVGStyleProps
    if (propsDeclaration.type === AST_NODE_TYPES.ObjectPattern) {
        const properties = propsDeclaration.properties.filter<Property>(
            (property): property is Property => property.type === AST_NODE_TYPES.Property,
        )
        /**
         * key.type = Identifier,
         * value.type = Identifier | AssignmentPattern | CallExpression
         */
        const propsEntries: [string, any][] = properties
            .map(({key, value}) => {
                const {name: propName} = key as Identifier
                if (value.type === AST_NODE_TYPES.Identifier) {
                    if (value.name === 'id') {
                        // id는 초기값이 없으면 'id'를 리턴하여 최적화에서 제외
                        return [propName, value.name]
                    }
                    return [propName, undefined]
                } else if (value.type === AST_NODE_TYPES.AssignmentPattern) {
                    const {right} = value
                    switch (right.type) {
                        case AST_NODE_TYPES.Literal:
                            return [propName, right.value]
                        case AST_NODE_TYPES.ObjectExpression:
                            return [propName, parseObjectExpression(right)]
                        case AST_NODE_TYPES.CallExpression: {
                            const {callee} = right
                            return [propName, `${(callee as Identifier).name}()`]
                        }
                    }
                } else if (value.type === AST_NODE_TYPES.CallExpression) {
                    // callee에 arguments 없다고 가정했지만 있을 경우 또한 추후에 처리 필요
                    const {callee} = value
                    return [propName, `${(callee as Identifier).name}()`]
                }
            })
            .filter((v): v is [string, any] => !!v)

        return Object.fromEntries(propsEntries)
    }
    // props: SVGStyleProps
    else if (propsDeclaration.type === AST_NODE_TYPES.Identifier && propsDeclaration.name === PROPS_IDENTIFIER_NAME) {
        /**
         * @description 본문에서 properties 가져와서 구조분해로 재구성
         */
        return propsDeclaration.name
    }

    return null
}

export const extractComponentProps = (node: ComponentAST) => {
    const componentDeclaration = getReactComponentDeclaration(node)

    // const Icon = () => {} or const Icon = memo(() => {})
    if (componentDeclaration.type === AST_NODE_TYPES.VariableDeclaration) {
        const variableDeclarator = componentDeclaration.declarations[0].init

        if (!variableDeclarator) {
            return null
        }

        // memo() 된 코드
        if (variableDeclarator.type === AST_NODE_TYPES.CallExpression) {
            const argument = variableDeclarator.arguments[0] as ArrowFunctionExpression
            const propsDeclaration = argument.params[0]

            return parsePropsDeclaration(propsDeclaration)
        }
        // memo() 되지 않은 코드
        else if (variableDeclarator.type === AST_NODE_TYPES.ArrowFunctionExpression) {
            const propsDeclaration = variableDeclarator.params[0]

            return parsePropsDeclaration(propsDeclaration)
        }
    }
    // function(){}
    else if (componentDeclaration.type === AST_NODE_TYPES.FunctionDeclaration) {
        const propsDeclaration = componentDeclaration.params[0]

        return parsePropsDeclaration(propsDeclaration)
    }

    return null
}
