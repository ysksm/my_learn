import { ID, TimestampedEntity } from '../../types';

/**
 * 納入商品エンティティ
 */
export interface Product extends TimestampedEntity {
  name: string;
  price: number;
  code?: string;
  description?: string;
  category?: string;
  isActive: boolean;
}

/**
 * 納入商品の作成用DTO
 */
export interface CreateProductDTO {
  name: string;
  price: number;
  code?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * 納入商品の更新用DTO
 */
export interface UpdateProductDTO {
  id: ID;
  name?: string;
  price?: number;
  code?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * 新しい納入商品エンティティを作成する
 */
export function createProduct(dto: CreateProductDTO): Product {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ...dto,
    isActive: dto.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 納入商品エンティティを更新する
 */
export function updateProduct(product: Product, dto: UpdateProductDTO): Product {
  return {
    ...product,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
}
