/**
 * ESLint rule to enforce that functions return Result type
 */

import { ESLintUtils } from '@typescript-eslint/utils';

type MessageIds = 'requireResultType' | 'missingReturnType';

export interface Options {
  allowedReturnTypes?: string[];
  exemptFunctions?: string[];
  exemptPatterns?: string[];
}

export const requireResultReturnType = ESLintUtils.RuleCreator(
  name => `https://github.com/fyuuki0jp/eslint-plugin-railway/blob/main/docs/rules/${name}.md`
)<Options[], MessageIds>({
  name: 'require-result-return-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require functions to return Result type for Railway Oriented Programming',
      recommended: 'recommended',
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          allowedReturnTypes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          exemptFunctions: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          exemptPatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireResultType:
        'Function "{{name}}" must return Result<T, E> type. Current return type: {{currentType}}',
      missingReturnType:
        'Function "{{name}}" must have an explicit return type annotation that returns Result<T, E>',
    },
  },
  defaultOptions: [
    {
      allowedReturnTypes: ['void', 'Promise<void>', 'never'],
      exemptFunctions: ['main', 'setup', 'teardown'],
      exemptPatterns: [],
    },
  ],
  create(context, [options]) {
    const allowedReturnTypes = options.allowedReturnTypes || ['void', 'Promise<void>', 'never'];
    const exemptFunctions = options.exemptFunctions || ['main', 'setup', 'teardown'];
    const exemptPatterns = options.exemptPatterns || [];

    function normalizeTypeText(typeText: string): string {
      return typeText.replace(/\s+/g, ' ').trim();
    }

    function isResultType(typeAnnotation: any): boolean {
      if (!typeAnnotation) return false;

      const sourceCode = context.getSourceCode();
      const typeText = normalizeTypeText(sourceCode.getText(typeAnnotation));

      const resultPatterns = [
        /^Result<[^>]+,\s*[^>]+>$/,           // Result<T, E>
        /^Result<[^>]+>$/,                    // Result<T> (with default error type)
        /^Promise<Result<[^>]+,\s*[^>]+>>$/,  // Promise<Result<T, E>>
        /^Promise<Result<[^>]+>>$/            // Promise<Result<T>>
      ];

      return resultPatterns.some(pattern => pattern.test(typeText));
    }

    function isAllowedReturnType(typeAnnotation: any): boolean {
      if (!typeAnnotation) return false;

      const sourceCode = context.getSourceCode();
      const typeText = normalizeTypeText(sourceCode.getText(typeAnnotation));

      return allowedReturnTypes.some(allowed => {
        const normalizedAllowed = normalizeTypeText(allowed);
        return typeText === normalizedAllowed ||
               typeText.includes(normalizedAllowed) ||
               new RegExp(`^${normalizedAllowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).test(typeText);
      });
    }

    function isExemptFunction(functionName: string): boolean {
      if (exemptFunctions.includes(functionName)) {
        return true;
      }

      const builtInUtilities = ['isOk', 'isErr', 'constructor', 'ok', 'err'];
      if (builtInUtilities.includes(functionName)) {
        return true;
      }

      if (exemptPatterns.some(pattern => {
        const regex = new RegExp(pattern);
        return regex.test(functionName);
      })) {
        return true;
      }

      const filename = context.getFilename();
      if (filename.includes('.spec.') || filename.includes('.test.')) {
        return true;
      }

      return false;
    }

    function getFunctionName(node: any): string {
      if (node.id && node.id.name) {
        return node.id.name;
      }
      if (node.key && node.key.name) {
        return node.key.name;
      }
      if (node.parent && node.parent.type === 'VariableDeclarator' && node.parent.id.name) {
        return node.parent.id.name;
      }
      if (node.parent && node.parent.type === 'Property' && node.parent.key.name) {
        return node.parent.key.name;
      }
      if (node.parent && node.parent.type === 'AssignmentExpression' && node.parent.left.name) {
        return node.parent.left.name;
      }
      return 'anonymous';
    }

    function shouldCheckFunction(node: any): boolean {
      if (!node.body) {
        return false;
      }

      if (node.kind === 'constructor' || node.kind === 'get' || node.kind === 'set') {
        return false;
      }

      if (node.type === 'MethodDefinition' && node.key && node.key.name === 'constructor') {
        return false;
      }

      if (node.parent && node.parent.type === 'MethodDefinition') {
        return false;
      }

      return true;
    }

    function checkFunction(node: any): void {
      if (!shouldCheckFunction(node)) {
        return;
      }

      const functionName = getFunctionName(node);

      if (isExemptFunction(functionName)) {
        return;
      }

      const returnType = node.returnType;

      if (!returnType) {
        context.report({
          node,
          messageId: 'missingReturnType',
          data: {
            name: functionName,
          },
        });
        return;
      }

      const typeAnnotation = returnType.typeAnnotation;

      if (!isResultType(typeAnnotation) && !isAllowedReturnType(typeAnnotation)) {
        const sourceCode = context.getSourceCode();
        const currentType = sourceCode.getText(typeAnnotation);

        context.report({
          node: returnType,
          messageId: 'requireResultType',
          data: {
            name: functionName,
            currentType: currentType,
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      MethodDefinition: checkFunction,
    };
  },
});
