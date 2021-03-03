"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTransformer = void 0;
const bundleRuntimeCore_1 = require("../../../bundleRuntime/bundleRuntimeCore");
const helpers_1 = require("../../helpers/helpers");
const AST_1 = require("../../interfaces/AST");
const ImportType_1 = require("../../interfaces/ImportType");
function convertQualifiedName(node) {
    if (node.type === AST_1.ASTType.QualifiedName)
        node.type = 'MemberExpression';
    if (node.left) {
        node.object = node.left;
        delete node.left;
        convertQualifiedName(node.object);
    }
    if (node.right) {
        node.property = node.right;
        delete node.right;
    }
    return node;
}
function getQualifierId(node) {
    if (node.left) {
        if (node.left.type === AST_1.ASTType.Identifier)
            return node.left.name;
        return getQualifierId(node.left);
    }
    if (node.type === AST_1.ASTType.Identifier)
        return node.name;
}
function ImportTransformer() {
    return {
        commonVisitors: props => {
            const { transformationContext: { compilerOptions }, } = props;
            const esModuleInterop = compilerOptions.esModuleInterop;
            const qualifierRefs = {};
            return {
                onProgramBody: (schema) => {
                    const { context, node } = schema;
                    if (node.type === AST_1.ASTType.ImportEqualsDeclaration) {
                        const moduleReference = node.moduleReference;
                        const moduleIdName = node.id.name;
                        const qualifierId = getQualifierId(moduleReference);
                        if (moduleReference.type === AST_1.ASTType.QualifiedName || moduleReference.type === AST_1.ASTType.Identifier) {
                            // considering the following scenario ->
                            // import { some } from "some"
                            // import SomeType = some.foo
                            // If SomeType is referenced as an object we should alias it
                            let isReferenced = false;
                            context.onRef(moduleIdName, localSchema => {
                                // waiting for reference. If reference lead to nothing
                                // that means we're referencing "mport SomeType" which is ignored by the scope tracker
                                if (!localSchema.getLocal(moduleIdName)) {
                                    isReferenced = true;
                                }
                            });
                            return context.onComplete(() => {
                                const memberReference = helpers_1.createVariableDeclaration(moduleIdName, convertQualifiedName(moduleReference));
                                if (isReferenced) {
                                    // set the flag for the import to know that it is being in use
                                    qualifierRefs[qualifierId] = 1;
                                    schema.replace(memberReference, { forceRevisit: true });
                                }
                                else
                                    schema.remove();
                            }, 0); // prioritise the callback to be ahead of imports
                        }
                        else {
                            const reqStatement = helpers_1.createRequireStatement(node.moduleReference.expression.value, node.id.name);
                            if (props.onRequireCallExpression) {
                                props.onRequireCallExpression(ImportType_1.ImportType.RAW_IMPORT, reqStatement.reqStatement);
                            }
                            return schema.replace(reqStatement.statement);
                        }
                    }
                    if (node.type === AST_1.ASTType.ImportDeclaration) {
                        if (node.importKind && node.importKind === 'type') {
                            return schema.remove();
                        }
                        const coreReplacements = context.coreReplacements;
                        const variable = context.getModuleName(node.source.value);
                        let injectDefaultInterop;
                        const specifiers = node.specifiers;
                        for (const specifier of specifiers) {
                            if (specifier.type === AST_1.ASTType.ImportSpecifier) {
                                coreReplacements[specifier.local.name] = {
                                    first: variable,
                                    second: specifier.imported.name,
                                };
                            }
                            else if (specifier.type === AST_1.ASTType.ImportDefaultSpecifier) {
                                let replacement;
                                if (esModuleInterop) {
                                    injectDefaultInterop = variable + 'd';
                                    replacement = {
                                        first: injectDefaultInterop,
                                        second: 'default',
                                    };
                                }
                                else {
                                    replacement = {
                                        first: variable,
                                        second: 'default',
                                    };
                                }
                                coreReplacements[specifier.local.name] = replacement;
                            }
                            else if (specifier.type === AST_1.ASTType.ImportNamespaceSpecifier) {
                                coreReplacements[specifier.local.name] = { first: variable };
                            }
                        }
                        return context.onComplete(() => {
                            const reqStatement = helpers_1.createRequireStatement(node.source.value, node.specifiers.length && variable);
                            if (specifiers.length === 0) {
                                if (props.onRequireCallExpression) {
                                    props.onRequireCallExpression(ImportType_1.ImportType.RAW_IMPORT, reqStatement.reqStatement);
                                    schema.replace(reqStatement.statement);
                                    schema.ensureESModuleStatement(compilerOptions);
                                    return;
                                }
                            }
                            let atLeastOneInUse = false;
                            for (const specifier of node.specifiers) {
                                const localName = specifier.local.name;
                                const traced = context.coreReplacements[localName];
                                // the only exception when when we check if the qualifier is referenced
                                if (qualifierRefs[localName]) {
                                    atLeastOneInUse = true;
                                    break;
                                }
                                if (traced && traced.inUse) {
                                    atLeastOneInUse = true;
                                    break; // we just need to know if we need to keep the node
                                }
                            }
                            // doing a manual replace
                            if (atLeastOneInUse) {
                                let statements = [reqStatement.statement];
                                if (injectDefaultInterop) {
                                    statements.push(helpers_1.createEsModuleDefaultInterop({
                                        helperObjectName: bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.GLOBAL_OBJ,
                                        helperObjectProperty: bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.INTEROP_REQUIRE_DEFAULT_FUNCTION,
                                        targetIdentifierName: variable,
                                        variableName: injectDefaultInterop,
                                    }));
                                }
                                if (props.onRequireCallExpression) {
                                    props.onRequireCallExpression(ImportType_1.ImportType.FROM, reqStatement.reqStatement);
                                }
                                schema.replace(statements);
                                schema.ensureESModuleStatement(compilerOptions);
                                return schema;
                            }
                            else
                                return schema.remove();
                        });
                    }
                },
            };
        },
    };
}
exports.ImportTransformer = ImportTransformer;
