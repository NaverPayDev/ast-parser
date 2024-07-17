import parseToAST from '../parser'
import {extractComponentProps, getJSXElement, getReactComponentDeclaration} from './react'

const escodegen = require('escodegen-wallaby')

const trimAll = (str: string) => str.replace(/\s+/g, '').replace(/'+/g, '"')

describe('React.js용 ast-parser 테스트', () => {
    test.concurrent.each([
        {
            code: `export default function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {}
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }
            `,
            result: `function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {}
            }) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                );
            }`,
        },
        {
            code: `function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }`,
            result: `function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {}
            }) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                );
            }`,
        },
        {
            code: `const IconExample = ({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) => {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }
            `,
            result: `const IconExample = ({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {}
            }) => {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                );
            };`,
        },
    ])('getReactComponentDeclaration', ({code, result}) => {
        const ast = parseToAST(code)
        const extractResult = getReactComponentDeclaration(ast)

        expect(trimAll(escodegen.generate(extractResult))).toBe(trimAll(result))
    })
    test.concurrent.each([
        {
            code: `export default function IconExample({
            fill = '#222',
            width = '100%',
            height = '100%',
            viewBox = '0 0 9 18',
            style = {}
        }: Partial<{
            fill: CSS.Property.Fill
            width: CSS.Property.Width<string | number>
            height: CSS.Property.Height<string | number>
            viewBox: string
            style: React.CSSProperties
        }>) {
            return (
                <svg width={width} height={height} viewBox={viewBox} style={style}>
                    <path
                        fill="none"
                        fillRule="evenodd"
                        stroke={fill}
                        strokeLinejoin="round"
                        d="M8.521 0L0.5 8.021 8.521 16"
                        transform="translate(0 1)"
                    />
                </svg>
            )
        }`,
            result: `(<svg width={width} height={height} viewBox={viewBox} style={style}>
            <path
                fill="none"
                fillRule="evenodd"
                stroke={fill}
                strokeLinejoin="round"
                d="M8.521 0L0.5 8.021 8.521 16"
                transform="translate(0 1)"
            />
        </svg>)`,
        },
        {
            code: `export default memo(({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) => {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            })`,
            result: `(
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )`,
        },
        {
            code: `export default memo(function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            })
            `,
            result: `(
                <svg width={width} height={height} viewBox={viewBox} style={style}>
                    <path
                        fill="none"
                        fillRule="evenodd"
                        stroke={fill}
                        strokeLinejoin="round"
                        d="M8.521 0L0.5 8.021 8.521 16"
                        transform="translate(0 1)"
                    />
                </svg>
            )`,
        },
        {
            code: `export default memo(({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) => <svg width={width} height={height} viewBox={viewBox} style={style}>
              <path
                fill="none"
                fillRule="evenodd"
                stroke={fill}
                strokeLinejoin="round"
                d="M8.521 0L0.5 8.021 8.521 16"
                transform="translate(0 1)"
              />
            </svg>)`,
            result: `(<svg width={width} height={height} viewBox={viewBox} style={style}>
                <path
                  fill="none"
                  fillRule="evenodd"
                  stroke={fill}
                  strokeLinejoin="round"
                  d="M8.521 0L0.5 8.021 8.521 16"
                  transform="translate(0 1)"
                />
              </svg>)`,
        },
    ])('getJSXElement', ({code, result}) => {
        const ast = parseToAST(code)
        const extractResult = getJSXElement(ast, 'svg')

        expect(trimAll(escodegen.generate(extractResult))).toBe(trimAll(result))
    })

    test.concurrent.each([
        {
            code: `function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }`,
            result: {
                fill: '#222',
                width: '100%',
                height: '100%',
                viewBox: '0 0 9 18',
                style: {},
            },
        },
        {
            code: `const IconExample = ({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) => {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }
            `,
            result: {
                fill: '#222',
                width: '100%',
                height: '100%',
                viewBox: '0 0 9 18',
                style: {},
            },
        },
        {
            code: `export default function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {}
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }
            `,
            result: {
                fill: '#222',
                width: '100%',
                height: '100%',
                viewBox: '0 0 9 18',
                style: {},
            },
        },
        {
            code: `export default memo(function IconExample({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            })`,
            result: {
                fill: '#222',
                width: '100%',
                height: '100%',
                viewBox: '0 0 9 18',
                style: {},
            },
        },
        {
            code: `export default memo(({
                fill = '#222',
                width = '100%',
                height = '100%',
                viewBox = '0 0 9 18',
                style = {},
            }: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) => <svg width={width} height={height} viewBox={viewBox} style={style}>
              <path
                fill="none"
                fillRule="evenodd"
                stroke={fill}
                strokeLinejoin="round"
                d="M8.521 0L0.5 8.021 8.521 16"
                transform="translate(0 1)"
              />
            </svg>)`,
            result: {
                fill: '#222',
                width: '100%',
                height: '100%',
                viewBox: '0 0 9 18',
                style: {},
            },
        },
        {
            code: `export default function IconExample(props: Partial<{
                fill: CSS.Property.Fill
                width: CSS.Property.Width<string | number>
                height: CSS.Property.Height<string | number>
                viewBox: string
                style: React.CSSProperties
            }>) {
                return (
                    <svg width={width} height={height} viewBox={viewBox} style={style}>
                        <path
                            fill="none"
                            fillRule="evenodd"
                            stroke={fill}
                            strokeLinejoin="round"
                            d="M8.521 0L0.5 8.021 8.521 16"
                            transform="translate(0 1)"
                        />
                    </svg>
                )
            }`,
            result: 'props',
        },
    ])('extractComponentProps', ({code, result}) => {
        const ast = parseToAST(code)
        const componentProps = extractComponentProps(ast)

        if (typeof result === 'string') {
            expect(componentProps).toBe(result)
        } else {
            expect(componentProps).toMatchObject(result)
        }
    })
})
