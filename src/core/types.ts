//Domain models / Bussiness models / NOT data models

//aggregate
export type TCustomer = {
  id: string;
  name: string;
  email: string;
}

//value object doesn't makes sense without entity or aggregate
export type TPrice = {
  currency: string;
  amount: number;
}

//aggregate
export type TProduct = {
  id: string;
  name: string;
  sku: string;
  price: TPrice;
}

//aggregate
export type TOrder = {
  id: string;
  customerEmail: string;
  customerId: string;
  orderItems: TOrderItem[];
}

//entity
export type TOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  price: TPrice;
}

//These are infrastructure services and repositories
export interface IOrdersRepository {
  getById: (id: string) => Promise<TOrder | null>;
  remove: (id: string) => void;
  create: (
    order: Omit<TOrder, 'id' | 'orderItems'>,
    orderItems: Omit<TOrderItem, 'id' | 'orderId'>[]
  ) => Promise<TOrder>;
  update: (
    order: Omit<TOrder, 'id' | 'orderItems'>,
    orderItems: (Omit<TOrderItem, 'id' | 'orderId'> | TOrderItem)[]
  ) => Promise<TOrder>;
}

export interface ICustomersService {
  getById: (id: string) => Promise<TCustomer | null>;
}

export interface IProductsService {
  getById: (productId: string) => Promise<TProduct>;
}