# CRMシステム クラス図

## ドメインモデル クラス図

以下のクラス図は、CRMシステムのドメインモデルの関係を示しています。

```mermaid
classDiagram
    class Entity {
        +ID id
    }
    
    class TimestampedEntity {
        +string createdAt
        +string updatedAt
    }
    
    class Account {
        +string name
        +string industry
        +string? address
        +string? phone
        +string? email
        +string? website
        +string? description
    }
    
    class Product {
        +string name
        +number price
        +string? code
        +string? description
        +string? category
        +boolean isActive
    }
    
    class Opportunity {
        +ID accountId
        +string name
        +OpportunityStage stage
        +number amount
        +string? closeDate
        +number? probability
        +string? description
    }
    
    class Activity {
        +RelatedTo relatedTo
        +ActivityType type
        +string subject
        +string date
        +string? dueDate
        +string? status
        +string? description
        +string? assignedTo
    }
    
    class RelatedTo {
        +RelatedToType type
        +ID id
    }
    
    Entity <|-- TimestampedEntity
    TimestampedEntity <|-- Account
    TimestampedEntity <|-- Product
    TimestampedEntity <|-- Opportunity
    TimestampedEntity <|-- Activity
    Opportunity --> Account
    Activity --> RelatedTo
```

## リポジトリ クラス図

以下のクラス図は、リポジトリのインターフェースと実装の関係を示しています。

```mermaid
classDiagram
    class Repository~T~ {
        <<interface>>
        +save(entity: T) Promise~T~
        +saveAll(entities: T[]) Promise~T[]~
        +findById(id: ID) Promise~T|null~
        +findAll() Promise~T[]~
        +findBy(predicate: (entity: T) => boolean) Promise~T[]~
        +deleteById(id: ID) Promise~boolean~
        +delete(entity: T) Promise~boolean~
        +deleteAll() Promise~boolean~
    }
    
    class LocalStorageRepository~T~ {
        -string storageKey
        +constructor(entityName: string)
        +save(entity: T) Promise~T~
        +saveAll(entities: T[]) Promise~T[]~
        +findById(id: ID) Promise~T|null~
        +findAll() Promise~T[]~
        +findBy(predicate: (entity: T) => boolean) Promise~T[]~
        +deleteById(id: ID) Promise~boolean~
        +delete(entity: T) Promise~boolean~
        +deleteAll() Promise~boolean~
        -saveToStorage(entities: T[]) void
        -dispatchStorageEvent(id?: ID) void
    }
    
    class AccountRepository {
        <<interface>>
    }
    
    class ProductRepository {
        <<interface>>
    }
    
    class OpportunityRepository {
        <<interface>>
    }
    
    class ActivityRepository {
        <<interface>>
    }
    
    class LocalStorageAccountRepository {
    }
    
    class LocalStorageProductRepository {
    }
    
    class LocalStorageOpportunityRepository {
    }
    
    class LocalStorageActivityRepository {
    }
    
    Repository <|.. LocalStorageRepository
    Repository <|-- AccountRepository
    Repository <|-- ProductRepository
    Repository <|-- OpportunityRepository
    Repository <|-- ActivityRepository
    AccountRepository <|.. LocalStorageAccountRepository
    ProductRepository <|.. LocalStorageProductRepository
    OpportunityRepository <|.. LocalStorageOpportunityRepository
    ActivityRepository <|.. LocalStorageActivityRepository
    LocalStorageRepository <|-- LocalStorageAccountRepository
    LocalStorageRepository <|-- LocalStorageProductRepository
    LocalStorageRepository <|-- LocalStorageOpportunityRepository
    LocalStorageRepository <|-- LocalStorageActivityRepository
```

## Redux状態管理 クラス図

以下のクラス図は、Reduxを使用した状態管理の構造を示しています。

```mermaid
classDiagram
    class Store {
        +configureStore()
    }
    
    class RootState {
        +AccountState accounts
        +ProductState products
        +OpportunityState opportunities
        +ActivityState activities
    }
    
    class AccountState {
        +Account[] accounts
        +Account|null selectedAccount
        +boolean loading
        +string|null error
    }
    
    class ProductState {
        +Product[] products
        +Product|null selectedProduct
        +boolean loading
        +string|null error
    }
    
    class OpportunityState {
        +Opportunity[] opportunities
        +Opportunity|null selectedOpportunity
        +boolean loading
        +string|null error
    }
    
    class ActivityState {
        +Activity[] activities
        +Activity|null selectedActivity
        +boolean loading
        +string|null error
    }
    
    class AccountSlice {
        +fetchAccounts() AsyncThunk
        +fetchAccountById(id: ID) AsyncThunk
        +createAccountAsync(dto: CreateAccountDTO) AsyncThunk
        +updateAccountAsync(dto: UpdateAccountDTO) AsyncThunk
        +deleteAccountAsync(id: ID) AsyncThunk
        +clearSelectedAccount() Action
        +selectAccount(account: Account) Action
    }
    
    class ProductSlice {
        +fetchProducts() AsyncThunk
        +fetchProductById(id: ID) AsyncThunk
        +createProductAsync(dto: CreateProductDTO) AsyncThunk
        +updateProductAsync(dto: UpdateProductDTO) AsyncThunk
        +deleteProductAsync(id: ID) AsyncThunk
        +clearSelectedProduct() Action
        +selectProduct(product: Product) Action
    }
    
    class OpportunitySlice {
        +fetchOpportunities() AsyncThunk
        +fetchOpportunityById(id: ID) AsyncThunk
        +createOpportunityAsync(dto: CreateOpportunityDTO) AsyncThunk
        +updateOpportunityAsync(dto: UpdateOpportunityDTO) AsyncThunk
        +deleteOpportunityAsync(id: ID) AsyncThunk
        +clearSelectedOpportunity() Action
        +selectOpportunity(opportunity: Opportunity) Action
    }
    
    class ActivitySlice {
        +fetchActivities() AsyncThunk
        +fetchActivityById(id: ID) AsyncThunk
        +createActivityAsync(dto: CreateActivityDTO) AsyncThunk
        +updateActivityAsync(dto: UpdateActivityDTO) AsyncThunk
        +deleteActivityAsync(id: ID) AsyncThunk
        +clearSelectedActivity() Action
        +selectActivity(activity: Activity) Action
    }
    
    Store --> RootState
    RootState --> AccountState
    RootState --> ProductState
    RootState --> OpportunityState
    RootState --> ActivityState
    AccountState <-- AccountSlice
    ProductState <-- ProductSlice
    OpportunityState <-- OpportunitySlice
    ActivityState <-- ActivitySlice
```

## コンポーネント構造 クラス図

以下のクラス図は、Reactコンポーネントの構造を示しています。

```mermaid
classDiagram
    class App {
        +render() JSX
    }
    
    class LocalStorageSyncComponent {
        +useLocalStorageSync()
        +render() null
    }
    
    class Navbar {
        +render() JSX
    }
    
    class HomePage {
        +render() JSX
    }
    
    class AccountsPage {
        -Account[] accounts
        -boolean loading
        -string|null error
        -boolean isCreating
        -boolean isEditing
        -Account|null selectedAccount
        -CreateAccountDTO formData
        +useEffect() void
        +handleInputChange() void
        +handleShowCreateForm() void
        +handleShowEditForm() void
        +handleCancelForm() void
        +handleCreateAccount() void
        +handleUpdateAccount() void
        +handleDeleteAccount() void
        +render() JSX
    }
    
    class ProductsPage {
        -Product[] products
        -boolean loading
        -string|null error
        -boolean isCreating
        -boolean isEditing
        -Product|null selectedProduct
        -CreateProductDTO formData
        +useEffect() void
        +handleInputChange() void
        +handleShowCreateForm() void
        +handleShowEditForm() void
        +handleCancelForm() void
        +handleCreateProduct() void
        +handleUpdateProduct() void
        +handleDeleteProduct() void
        +render() JSX
    }
    
    class OpportunitiesPage {
        -Opportunity[] opportunities
        -boolean loading
        -string|null error
        -boolean isCreating
        -boolean isEditing
        -Opportunity|null selectedOpportunity
        -CreateOpportunityDTO formData
        +useEffect() void
        +handleInputChange() void
        +handleShowCreateForm() void
        +handleShowEditForm() void
        +handleCancelForm() void
        +handleCreateOpportunity() void
        +handleUpdateOpportunity() void
        +handleDeleteOpportunity() void
        +render() JSX
    }
    
    class ActivitiesPage {
        -Activity[] activities
        -boolean loading
        -string|null error
        -boolean isCreating
        -boolean isEditing
        -Activity|null selectedActivity
        -CreateActivityDTO formData
        +useEffect() void
        +handleInputChange() void
        +handleShowCreateForm() void
        +handleShowEditForm() void
        +handleCancelForm() void
        +handleCreateActivity() void
        +handleUpdateActivity() void
        +handleDeleteActivity() void
        +render() JSX
    }
    
    App --> LocalStorageSyncComponent
    App --> Navbar
    App --> HomePage
    App --> AccountsPage
    App --> ProductsPage
    App --> OpportunitiesPage
    App --> ActivitiesPage
