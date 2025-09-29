# Reactの非同期処理の難しさと対策

## はじめに

Reactアプリケーションにおいて非同期処理は避けて通れない重要な要素です。APIコール、ファイル読み込み、タイマー処理など、様々な場面で非同期処理が必要になります。しかし、Reactの宣言的なUIパラダイムと非同期処理の組み合わせには多くの落とし穴があります。

## Reactの非同期処理における主な課題

### 1. メモリリーク問題

**問題**: コンポーネントがアンマウントされた後も非同期処理が続行し、setState を呼び出そうとする

```typescript
// ❌ 悪い例
function BadComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result); // コンポーネントがアンマウントされていても実行される
    });
  }, []);

  return <div>{data}</div>;
}
```

**解決策**: AbortController や useEffect のクリーンアップを使用

```typescript
// ✅ 良い例
function GoodComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchData({ signal: controller.signal })
      .then(result => {
        if (!controller.signal.aborted) {
          setData(result);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, []);

  return <div>{data}</div>;
}
```

### 2. 競合状態（Race Condition）

**問題**: 複数の非同期リクエストが異なる順序で完了し、古いデータで新しいデータが上書きされる

```typescript
// ❌ 悪い例
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      search(query).then(setResults); // 古い検索結果が新しい結果を上書きする可能性
    }
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{results.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </div>
  );
}
```

**解決策**: 最新のリクエストのみを有効にする

```typescript
// ✅ 良い例
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();

    search(query, { signal: controller.signal })
      .then(newResults => {
        if (!controller.signal.aborted) {
          setResults(newResults);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{results.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </div>
  );
}
```

### 3. エラーハンドリングの複雑さ

**問題**: 非同期エラーが適切にキャッチされず、アプリケーションが不安定になる

```typescript
// ❌ 悪い例
function DataComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData); // エラーハンドリングなし
  }, []);

  return <div>{data?.name}</div>; // data が null の場合の考慮不足
}
```

**解決策**: 包括的なエラーハンドリング

```typescript
// ✅ 良い例
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchData({ signal: controller.signal });

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>{data.name}</div>;
}
```

### 4. 依存配列の管理

**問題**: useEffect の依存配列の管理が複雑で、無限ループや不要な再実行が発生

```typescript
// ❌ 悪い例
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const userData = await getUser(userId);
    setUser(userData);
  };

  useEffect(() => {
    fetchUser(); // fetchUser は毎回新しい関数なので無限ループ
  }, [fetchUser]);

  return <div>{user?.name}</div>;
}
```

**解決策**: useCallback の適切な使用

```typescript
// ✅ 良い例
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async (signal) => {
    try {
      const userData = await getUser(userId, { signal });
      if (!signal.aborted) {
        setUser(userData);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    }
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(controller.signal);
    return () => controller.abort();
  }, [fetchUser]);

  return <div>{user?.name}</div>;
}
```

## よくあるアンチパターン

### 1. 不適切な Promise の使用

```typescript
// ❌ アンチパターン
useEffect(() => {
  setLoading(true);
  fetchData()
    .then(data => setData(data))
    .finally(() => setLoading(false)); // エラー時もローディングが終了
}, []);
```

### 2. ネストした非同期処理

```typescript
// ❌ アンチパターン
useEffect(() => {
  getUser(userId).then(user => {
    getUserPosts(user.id).then(posts => {
      setUserPosts(posts);
    });
  });
}, [userId]);
```

### 3. 状態更新の競合

```typescript
// ❌ アンチパターン
const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitData();
    setSuccess(true);
  } catch (error) {
    setError(error);
  }
  setLoading(false); // 成功・エラー時の状態が混在する可能性
};
```

## ベストプラクティス

### 1. カスタムフックによる抽象化

非同期処理のロジックをカスタムフックに抽象化することで、再利用性と保守性を向上させます。

```typescript
function useAsyncOperation(asyncFunction, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef();

  const execute = useCallback(async (...args) => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(signal, ...args);
      if (!signal.aborted) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (error) {
      if (!signal.aborted) {
        setState(prev => ({ ...prev, loading: false, error }));
      }
    }
  }, dependencies);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { ...state, execute };
}
```

### 2. Result パターンの採用

エラーハンドリングを明示的にするため、Result パターンを採用します。

```typescript
class Result<T, E = Error> {
  static success<T>(value: T): Result<T> {
    return new Success(value);
  }

  static error<E>(error: E): Result<any, E> {
    return new Failure(error);
  }

  abstract isSuccess(): boolean;
  abstract isError(): boolean;
  abstract getValue(): T;
  abstract getError(): E;
}

// API層での使用例
async function fetchUserSafely(id: string): Promise<Result<User, ApiError>> {
  try {
    const user = await api.getUser(id);
    return Result.success(user);
  } catch (error) {
    return Result.error(new ApiError(error.message));
  }
}
```

### 3. TypeScript による型安全性の確保

非同期処理の状態を型で明示的に表現します。

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function useTypedAsync<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const execute = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const data = await asyncFn();
      setState({ status: 'success', data });
    } catch (error) {
      setState({ status: 'error', error: error as Error });
    }
  }, [asyncFn]);

  return { state, execute };
}
```

## RxJS を使用した解決策

複雑な非同期処理については、RxJS の使用を検討することができます。

### メリット

1. **宣言的な記述**: オペレーターチェーンによる読みやすいコード
2. **キャンセル処理**: unsubscribe による自動的なキャンセル
3. **エラーハンドリング**: catchError オペレーターによる洗練されたエラー処理
4. **時間ベース操作**: interval、debounce、timeout などの充実したオペレーター

### 使用例

```typescript
function useRxAsyncData(url: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const subscription = from(fetch(url))
      .pipe(
        switchMap(response => response.json()),
        timeout(5000),
        catchError(error => {
          setError(error);
          return EMPTY;
        })
      )
      .subscribe({
        next: data => {
          setData(data);
          setLoading(false);
        },
        error: error => {
          setError(error);
          setLoading(false);
        }
      });

    return () => subscription.unsubscribe();
  }, [url]);

  return { data, loading, error };
}
```

## まとめ

React での非同期処理は慎重な設計が必要です。主な注意点：

1. **メモリリーク防止**: 必ずクリーンアップ関数を実装
2. **競合状態の回避**: 最新のリクエストのみを有効にする
3. **包括的なエラーハンドリング**: すべてのエラーケースを考慮
4. **型安全性**: TypeScript を活用した型定義
5. **適切な抽象化**: カスタムフックやライブラリの活用

複雑な非同期処理が必要な場合は、RxJS のような専門ライブラリの導入も検討する価値があります。重要なのは、プロジェクトの要件と開発チームのスキルレベルに応じて、適切な手法を選択することです。