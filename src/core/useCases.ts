import { ICustomersService, IOrdersRepository, IProductsService, TOrder } from "./types";

interface OrderItemDto {
  productId: string;
  priceAmount: number;
  currency: string;
}

export interface PlaceAnOrderRequestDto {
  orderItems: OrderItemDto[];
  customerId: string;
}

interface AddOrderItemRequestDto {
  orderId: string;
  orderItem: OrderItemDto;
}

interface RemoveOrderItemRequestDto {
  orderId: string;
  orderItemId: string;
}

interface GetOrderDetailsRequestDto {
  orderId: string, 
  customerId: string,
}

interface GetOrderDetailsResponseDto {
  orderId: string;
  customerEmail: string;
  orderItems: {
    priceAmount: number;
    currency: string;
    productName: string;
    sku: string;
  }[]
} 

export const hanldePlaceAnOrder = async (
  request: PlaceAnOrderRequestDto,
  ordersRepo: IOrdersRepository,
  customersService: ICustomersService
): Promise<TOrder> => {
  const { orderItems, customerId } = request;

  //Let's say that order can't exist with 0 orderLine items and can't be more than 5
  if (orderItems.length === 0 || orderItems.length > 5) {
    throw new Error("Order items cannot be empty");
  }

  //We must also get customer email in order to persist order
  const customer = await customersService.getById(customerId);

  if (!customer) {
    throw new Error("Customer not found!");
  }

  const order = {
    customerEmail: customer.email,
    customerId
  }
  //here is bug
  const orderItemsToAdd = orderItems.map(item => {
    return {
      productId: item.productId,
      price: {
        currency: "EUR",
        amount: item.priceAmount
      }
    }
  })
  //persist it somewhere (it might be anywhere becouse )
  return await ordersRepo.create(order, orderItemsToAdd);
}

export const hanldeAddOrderItem = async (
  request:AddOrderItemRequestDto,
  ordersRepo: IOrdersRepository,
) => {
  const { orderItem, orderId } = request;

  //we need to get order
  const order = await ordersRepo.getById(orderId);

  if(!order) {
    throw new Error("Order not found");
  }

  //Let's say that order can have max 5 items
  if (order.orderItems.length >= 5) {
    throw new Error("Order can't have more than 5 items");
  }

  // here is bug and inconsistency in our BL
  const orderItemToCreate = {
    productId: orderItem.productId,
    price: {
      currency: "EUR",
      amount: orderItem.priceAmount
    }
  }

  const orderItems = [...order.orderItems, orderItemToCreate];

  return ordersRepo.update(order, orderItems);
}

export const hanldeRemoveOrderItem = async (
  request:RemoveOrderItemRequestDto,
  ordersRepo: IOrdersRepository,
) => {
  const { orderId, orderItemId } = request;
  //we need to get order
  const order = await ordersRepo.getById(orderId);

  if(!order) {
    throw new Error("Order Not found");
  }

  const orderItemIndex = order.orderItems.findIndex(item => item.id === orderItemId);
  
  if(orderItemIndex === -1) {
    throw new Error("Order does not contain order item with id ..... ");
  }

  //Let's say that order can't exist with 0 orderLine items
  if(order.orderItems.length === 1) {
    ordersRepo.remove(orderId);
  }

  order.orderItems.splice(orderItemIndex,1);

  ordersRepo.update(order, order.orderItems);
}

export const handleGetOrderDetails = async (
  request: GetOrderDetailsRequestDto,
  ordersRepo: IOrdersRepository,
  customersService: ICustomersService,
  productsService: IProductsService,
) => {
  const { orderId, customerId } = request;

  const order = await ordersRepo.getById(orderId);

  if(!order) {
    throw new Error("Order not found!");
  }
  
  //Let's say that orders are visable only for customer who placed an order
  if(order.customerId !== customerId) {
    throw new Error("Order doesn't belong to this customer");
  }

  const customer = await customersService.getById(customerId);

  if(!customer) {
    throw new Error("Customer not found");
  }

  const orderItems = await Promise.all(order.orderItems.map(async item => {
    const product = await productsService.getById(item.productId);
    return {
      priceAmount: item.price.amount,
      currency: item.price.currency,
      productName: product.name,
      sku: product.sku,
    }
  }))

  const orderToReturn: GetOrderDetailsResponseDto = {
    orderId,
    customerEmail: customer.email,
    orderItems
  }

  return orderToReturn;
}