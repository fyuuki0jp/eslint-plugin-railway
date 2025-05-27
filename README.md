# @fyuuki0jp/eslint-plugin-railway

ESLint plugin to enforce Railway Oriented Programming patterns with Result types.

## インストール

```bash
npm install --save-dev @fyuuki0jp/eslint-plugin-railway
```

## 設定

### 推奨設定（最も簡単）

`eslint.config.mjs` (ESLint Flat Config):

```javascript
import railwayPlugin from '@fyuuki0jp/eslint-plugin-railway';

export default [
  // 他の設定...
  railwayPlugin.configs.recommended,
];
```

この設定により、以下が自動的に適用されます：
- `src/**/*.{ts,tsx}` ファイルに対してResult型チェックを実行
- テストファイル (`*.spec.ts`, `*.test.ts`) は除外
- 適切な除外関数とパターンが設定済み

### カスタム設定

個別にルールを設定したい場合：

```javascript
import railwayPlugin from '@fyuuki0jp/eslint-plugin-railway';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@fyuuki0jp/railway': railwayPlugin,
    },
    rules: {
      '@fyuuki0jp/railway/require-result-return-type': 'error',
    },
  },
];
```

### 厳格設定

より厳しいルールを適用したい場合：

```javascript
import railwayPlugin from '@fyuuki0jp/eslint-plugin-railway';

export default [
  railwayPlugin.configs.strict,
];
```

## ルール

### `require-result-return-type`

関数がResult型を返すことを強制します。

#### オプション

```javascript
{
  "allowedReturnTypes": ["void", "Promise<void>", "never"], // 許可される戻り値型
  "exemptFunctions": ["main", "setup", "teardown"],         // 除外する関数名
  "exemptPatterns": ["^test", "^spec"]                      // 除外するパターン（正規表現）
}
```

#### 例

❌ 悪い例:

```typescript
function processData(data: string): string {
  return data.toUpperCase();
}
```

✅ 良い例:

```typescript
function processData(data: string): Result<string, Error> {
  return ok(data.toUpperCase());
}
```

## ライセンス

MIT
