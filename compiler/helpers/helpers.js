"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPropertyOrPropertyAccess = exports.createASTFromObject = exports.createRequireCallExpression = exports.createEsModuleDefaultInterop = exports.ES_MODULE_EXPRESSION = exports.createRequireStatement = exports.createExports = exports.createLiteral = exports.createVariableDeclaration = exports.defineVariable = exports.createExpressionStatement = exports.createMemberExpression = exports.isDefinedLocally = exports.isValidMethodDefinition = exports.isLocalIdentifier = void 0;
const AST_1 = require("../interfaces/AST");
const _isLocalIdentifierRulesExceptionNodes = {
    ArrayPattern: 1,
    ClassDeclaration: 1,
    FunctionDeclaration: 1,
    FunctionExpression: 1,
    ImportDeclaration: 1,
    //ArrowFunctionExpression: 1,
    ImportDefaultSpecifier: 1,
    ImportNamespaceSpecifier: 1,
    ImportSpecifier: 1,
    RestElement: 1,
    [AST_1.ASTType.CatchClause]: 1,
    [AST_1.ASTType.ImportEqualsDeclaration]: 1,
    [AST_1.ASTType.QualifiedName]: 1,
    [AST_1.ASTType.TypeReference]: 1,
    //  [ASTType.VariableDeclarator]: 1,
};
function isLocalIdentifier(node, parent, propertyName) {
    if (propertyName === 'params')
        return;
    if (node.type === 'Identifier') {
        if (propertyName === 'superClass')
            return true;
        if (parent && parent.type === AST_1.ASTType.AssignmentPattern && parent.left === node) {
            return;
        }
        if (_isLocalIdentifierRulesExceptionNodes[parent.type] || parent.$assign_pattern)
            return;
        if (parent) {
            if (parent.computed)
                return true;
            return parent.property !== node && !parent.computed && parent.key !== node;
        }
    }
}
exports.isLocalIdentifier = isLocalIdentifier;
function isValidMethodDefinition(node) {
    return node.type === 'MethodDefinition' && node.value.type === 'FunctionExpression' && node.value.body;
}
exports.isValidMethodDefinition = isValidMethodDefinition;
function isDefinedLocally(node) {
    // if (node.id && node.id.name) {
    //   return [node.id.name];
    // }
    if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
        if (node.id)
            return [{ init: true, name: node.id.name }];
    }
    if (node.$assign_pattern && node.value && node.value.type === AST_1.ASTType.Identifier) {
        return [{ init: true, name: node.value.name }];
    }
    if (node.type === 'VariableDeclaration') {
        const defined = [];
        if (node.declarations) {
            for (const decl of node.declarations) {
                if (decl.type === 'VariableDeclarator' && decl.id) {
                    if (decl.id.type === 'Identifier') {
                        defined.push({ init: !!decl.init, name: decl.id.name });
                    }
                    else if (decl.id.type === AST_1.ASTType.ObjectPattern) {
                    }
                }
            }
            return defined;
        }
    }
}
exports.isDefinedLocally = isDefinedLocally;
function createMemberExpression(obj, target) {
    return {
        computed: false,
        object: {
            name: obj,
            type: 'Identifier',
        },
        property: {
            name: target,
            type: 'Identifier',
        },
        type: 'MemberExpression',
    };
}
exports.createMemberExpression = createMemberExpression;
function createExpressionStatement(left, right) {
    return {
        expression: {
            left: left,
            operator: '=',
            right: right,
            type: 'AssignmentExpression',
        },
        type: 'ExpressionStatement',
    };
}
exports.createExpressionStatement = createExpressionStatement;
function defineVariable(name, right) {
    return {
        declarations: [
            {
                id: {
                    name: name,
                    type: 'Identifier',
                },
                init: right,
                type: 'VariableDeclarator',
            },
        ],
        kind: 'var',
        type: 'VariableDeclaration',
    };
}
exports.defineVariable = defineVariable;
function createVariableDeclaration(name, node) {
    return {
        declarations: [
            {
                id: {
                    name: name,
                    type: 'Identifier',
                },
                init: node,
                type: 'VariableDeclarator',
            },
        ],
        kind: 'let',
        type: 'VariableDeclaration',
    };
}
exports.createVariableDeclaration = createVariableDeclaration;
function createLiteral(value) {
    return { type: 'Literal', value };
}
exports.createLiteral = createLiteral;
function createExports(props) {
    let obj = {
        name: props.exportsKey,
        type: 'Identifier',
    };
    if (props.useModule && props.exportsKey === 'exports') {
        obj = {
            computed: false,
            object: {
                name: 'module',
                optional: false,
                type: 'Identifier',
            },
            property: {
                name: 'exports',
                type: 'Identifier',
            },
            type: 'MemberExpression',
        };
    }
    return {
        expression: {
            left: {
                computed: false,
                object: obj,
                property: {
                    name: props.exportsVariableName,
                    type: 'Identifier',
                },
                type: 'MemberExpression',
            },
            operator: '=',
            right: props.property,
            type: 'AssignmentExpression',
        },
        type: 'ExpressionStatement',
    };
}
exports.createExports = createExports;
function createRequireStatement(source, local) {
    const reqStatement = {
        arguments: [
            {
                type: 'Literal',
                value: source,
            },
        ],
        callee: {
            name: 'require',
            type: 'Identifier',
        },
        type: 'CallExpression',
    };
    if (!local) {
        return {
            reqStatement,
            statement: {
                expression: reqStatement,
                type: 'ExpressionStatement',
            },
        };
    }
    return {
        reqStatement,
        statement: {
            type: 'VariableDeclaration',
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: {
                        name: local,
                        type: 'Identifier',
                    },
                    init: reqStatement,
                },
            ],
            kind: 'var',
        },
    };
}
exports.createRequireStatement = createRequireStatement;
function findObject(node, accessList) {
    if (!node.object) {
        return;
    }
    if (!node.object.name) {
        accessList.unshift(node.property.name);
        return findObject(node.object, accessList);
    }
    accessList.unshift(node.property.name);
    return node.object;
}
const _CallExpression = {
    CallExpression: 1,
    NewExpression: 1,
};
exports.ES_MODULE_EXPRESSION = {
    expression: {
        left: {
            computed: false,
            object: {
                name: 'exports',
                type: 'Identifier',
            },
            property: {
                name: '__esModule',
                type: 'Identifier',
            },
            type: 'MemberExpression',
        },
        operator: '=',
        right: {
            type: 'Literal',
            value: true,
        },
        type: 'AssignmentExpression',
    },
    type: 'ExpressionStatement',
};
function createEsModuleDefaultInterop(props) {
    return {
        declarations: [
            {
                id: {
                    name: props.variableName,
                    type: 'Identifier',
                },
                init: {
                    arguments: [
                        {
                            name: props.targetIdentifierName,
                            type: 'Identifier',
                        },
                    ],
                    callee: {
                        computed: false,
                        object: {
                            name: props.helperObjectName,
                            type: 'Identifier',
                        },
                        property: {
                            name: props.helperObjectProperty,
                            type: 'Identifier',
                        },
                        type: 'MemberExpression',
                    },
                    type: 'CallExpression',
                },
                type: 'VariableDeclarator',
            },
        ],
        kind: 'var',
        type: 'VariableDeclaration',
    };
}
exports.createEsModuleDefaultInterop = createEsModuleDefaultInterop;
function createRequireCallExpression(elements) {
    return {
        arguments: elements,
        callee: {
            name: 'require',
            type: 'Identifier',
        },
        type: 'CallExpression',
    };
}
exports.createRequireCallExpression = createRequireCallExpression;
function createASTFromObject(obj) {
    const properties = [];
    const parent = {
        properties,
        type: 'ObjectExpression',
    };
    for (const key in obj) {
        properties.push({
            computed: false,
            key: {
                name: key,
                type: 'Identifier',
            },
            kind: 'init',
            shorthand: false,
            type: 'Property',
            value: {
                type: 'Literal',
                value: obj[key],
            },
        });
    }
    return parent;
}
exports.createASTFromObject = createASTFromObject;
function isPropertyOrPropertyAccess(node, parent, propertyName) {
    const accessList = [];
    if (_CallExpression[node.type] && node.callee) {
        if (node.callee.name === propertyName) {
            return [propertyName];
        }
        if (node.callee.type === 'MemberExpression') {
            const obj = findObject(node.callee, accessList);
            accessList.unshift(propertyName);
            if (obj && obj.name === propertyName)
                return accessList;
        }
    }
    if (node.type === 'MemberExpression') {
        if (node.object && node.object.name === propertyName) {
            return [propertyName, node.property.name];
        }
        if (parent && parent.type !== 'MemberExpression') {
            if (node.property)
                accessList.unshift(node.property.name);
            let obj = findObject(node.object, accessList);
            if (obj && obj.name === propertyName) {
                accessList.unshift(propertyName);
                return accessList;
            }
        }
    }
}
exports.isPropertyOrPropertyAccess = isPropertyOrPropertyAccess;