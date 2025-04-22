# CRMシステム シーケンス図

## データ作成フロー

以下のシーケンス図は、新しいエンティティ（例：取引先）を作成する際のデータフローを示しています。

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant Redux as Redux Store
    participant Thunk as Redux Thunk
    participant Domain as Domain Model
    participant Repo as Repository
    participant Storage as LocalStorage
    
    User->>UI: フォーム入力
    User->>UI: 作成ボタンクリック
    UI->>Redux: createAccountAsync(dto)をディスパッチ
    Redux->>Thunk: createAccountAsync(dto)を実行
    Thunk->>Domain: createAccount(dto)を呼び出し
    Domain-->>Thunk: 新しいAccountエンティティを返却
    Thunk->>Repo: save(account)を呼び出し
    Repo->>Storage: LocalStorageにデータを保存
    Storage-->>Repo: 保存完了
    Repo->>Storage: storageイベントをディスパッチ
    Repo-->>Thunk: 保存されたエンティティを返却
    Thunk-->>Redux: アクション完了、状態を更新
    Redux-->>UI: 新しい状態でUIを更新
    UI-->>User: 更新されたUIを表示
```

## データ取得フロー

以下のシーケンス図は、アプリケーション起動時にデータを取得する際のフローを示しています。

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant Redux as Redux Store
    participant Thunk as Redux Thunk
    participant Repo as Repository
    participant Storage as LocalStorage
    
    User->>UI: ページにアクセス
    UI->>Redux: fetchAccounts()をディスパッチ
    Redux->>Thunk: fetchAccounts()を実行
    Thunk->>Repo: findAll()を呼び出し
    Repo->>Storage: LocalStorageからデータを取得
    Storage-->>Repo: 保存されたデータを返却
    Repo-->>Thunk: エンティティの配列を返却
    Thunk-->>Redux: アクション完了、状態を更新
    Redux-->>UI: 新しい状態でUIを更新
    UI-->>User: データを表示
```

## データ更新フロー

以下のシーケンス図は、既存のエンティティを更新する際のフローを示しています。

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant Redux as Redux Store
    participant Thunk as Redux Thunk
    participant Domain as Domain Model
    participant Repo as Repository
    participant Storage as LocalStorage
    
    User->>UI: 編集フォーム入力
    User->>UI: 更新ボタンクリック
    UI->>Redux: updateAccountAsync(dto)をディスパッチ
    Redux->>Thunk: updateAccountAsync(dto)を実行
    Thunk->>Repo: findById(dto.id)を呼び出し
    Repo->>Storage: LocalStorageからデータを取得
    Storage-->>Repo: 既存のエンティティを返却
    Repo-->>Thunk: 既存のエンティティを返却
    Thunk->>Domain: updateAccount(account, dto)を呼び出し
    Domain-->>Thunk: 更新されたエンティティを返却
    Thunk->>Repo: save(updatedAccount)を呼び出し
    Repo->>Storage: LocalStorageにデータを保存
    Storage-->>Repo: 保存完了
    Repo->>Storage: storageイベントをディスパッチ
    Repo-->>Thunk: 保存されたエンティティを返却
    Thunk-->>Redux: アクション完了、状態を更新
    Redux-->>UI: 新しい状態でUIを更新
    UI-->>User: 更新されたUIを表示
```

## データ削除フロー

以下のシーケンス図は、エンティティを削除する際のフローを示しています。

```mermaid
sequenceDiagram
    actor User
    participant UI as React Component
    participant Redux as Redux Store
    participant Thunk as Redux Thunk
    participant Repo as Repository
    participant Storage as LocalStorage
    
    User->>UI: 削除ボタンクリック
    UI->>UI: 確認ダイアログを表示
    User->>UI: 削除を確認
    UI->>Redux: deleteAccountAsync(id)をディスパッチ
    Redux->>Thunk: deleteAccountAsync(id)を実行
    Thunk->>Repo: deleteById(id)を呼び出し
    Repo->>Storage: LocalStorageからデータを取得
    Storage-->>Repo: 既存のデータを返却
    Repo->>Storage: 更新されたデータを保存
    Storage-->>Repo: 保存完了
    Repo->>Storage: storageイベントをディスパッチ
    Repo-->>Thunk: 削除結果（boolean）を返却
    Thunk-->>Redux: アクション完了、状態を更新
    Redux-->>UI: 新しい状態でUIを更新
    UI-->>User: 更新されたUIを表示
```

## タブ間同期フロー

以下のシーケンス図は、複数のタブ間でデータを同期する際のフローを示しています。

```mermaid
sequenceDiagram
    actor User1
    actor User2
    participant UI1 as Tab 1 UI
    participant Redux1 as Tab 1 Redux
    participant Storage as LocalStorage
    participant Redux2 as Tab 2 Redux
    participant UI2 as Tab 2 UI
    
    User1->>UI1: データを更新
    UI1->>Redux1: アクションをディスパッチ
    Redux1->>Storage: データを保存
    Storage->>Storage: storageイベントを発火
    Storage->>Redux2: storageイベントをリッスン
    Redux2->>Redux2: fetchAccounts()をディスパッチ
    Redux2->>Storage: データを再取得
    Storage-->>Redux2: 更新されたデータを返却
    Redux2-->>UI2: 新しい状態でUIを更新
    UI2-->>User2: 更新されたデータを表示
