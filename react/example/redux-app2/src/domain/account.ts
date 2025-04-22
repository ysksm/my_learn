
export interface Account {
    id: string;
    name: string;
    assets: Asset[];
    todos: Todo[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Asset {
    id: string;
    name: string;
    value: number;
}

export interface Todo {
    id: string;
    title: string;
    completed: boolean;
}