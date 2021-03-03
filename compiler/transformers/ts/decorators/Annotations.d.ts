import { ASTNode } from '../../../interfaces/AST';
export declare const KNOWN_IDENTIFIERS: {
    RegExp: string;
    boolean: string;
    Number: string;
    String: string;
    Function: string;
    Object: string;
    Symbol: string;
    Error: string;
    EvalError: string;
    RangeError: string;
    ReferenceError: string;
    SyntaxError: string;
    TypeError: string;
    URIError: string;
    Date: string;
    Array: string;
    Int8Array: string;
    Uint8Array: string;
    Uint8ClampedArray: string;
    Int16Array: string;
    Uint16Array: string;
    Int32Array: string;
    Uint32Array: string;
    Float32Array: string;
    Float64Array: string;
    BigInt64Array: string;
    BigUint64Array: string;
    Map: string;
    Set: string;
    WeakMap: string;
    WeakSet: string;
    ArrayBuffer: string;
    DataView: string;
    Promise: string;
    VoidFunction: string;
    GeneratorFunction: string;
    FunctionConstructor: string;
    FunctionStringCallback: string;
    XMLHttpRequest: string;
    CallableFunction: string;
};
export declare const voidZero: {
    type: string;
    operator: string;
    argument: {
        type: string;
        value: number;
    };
    prefix: boolean;
};
export declare function convertTypeAnnotation(node: ASTNode): any;
