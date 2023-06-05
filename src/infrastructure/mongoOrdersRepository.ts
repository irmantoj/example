import { IOrdersRepository, TOrder, TOrderItem } from "../core/types";
import mongoose from 'mongoose';


const orderItemSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    priceAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
});

const orderSchema = new mongoose.Schema({
    customerEmail: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        required: true
    },
});

const OrderItem = mongoose.model('orderItems', orderItemSchema);
const Order = mongoose.model('orders', orderSchema);


const mapToOrderEntity = (order:any, orderItems:any[]) => {
    return {
        id: order._id.toString(),
        customerEmail: order.customerEmail,
        customerId: order.customerId,
        orderItems: orderItems.map(oi => ({
            id: oi._id.toString(),
            orderId: order.id,
            productId: oi.productId,
            price: {
                amount: oi.priceAmount,
                currency: oi.currency
            }
        }))
    }
}


const getById = async (id: string): Promise<TOrder | null> => {
    const order = await Order.findById(id);

    if (!order) {
        return null;
    }

    const orderItems = await OrderItem.find({
        orderId: id
    });

    return mapToOrderEntity(order, orderItems) as TOrder;
}

const create = async (
    order: Omit<TOrder, "id" | "orderItems">, 
    orderItems: Omit<TOrderItem, "id" | "orderId">[]
) => {
    //should be transaction
    const createdOrder = await Order.create(order);
    const createdOrderItems = await Promise.all(orderItems.map(async item => OrderItem.create({
        orderId: createdOrder._id.toString(),
        productId: item.productId,
        priceAmount: item.price.amount, 
        currency: item.price.currency
    })));
    return mapToOrderEntity(createdOrder, createdOrderItems) as TOrder;
}


export const mongoOrdersRepository: IOrdersRepository = {
    getById,
    remove: function (id: string): void {
        throw new Error("Function not implemented.");
    },
    create,
    update: function (order: Omit<TOrder, "id" | "orderItems">, orderItems: (TOrderItem | Omit<TOrderItem, "id" | "orderId">)[]): Promise<TOrder> {
        throw new Error("Function not implemented.");
    }
}