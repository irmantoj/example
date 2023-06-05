import express from "express";
import { hanldePlaceAnOrder, hanldeAddOrderItem, PlaceAnOrderRequestDto } from "../core/useCases";
import { customersService } from "../infrastructure/customersService";
import { mongoOrdersRepository } from "../infrastructure/mongoOrdersRepository";

const ordersRouter = express.Router();

ordersRouter.post("/api/orders", async (req, res) => {
    try {
        const placeAnOrderRequest = req.body as PlaceAnOrderRequestDto
        const result = await hanldePlaceAnOrder(
            placeAnOrderRequest,
            mongoOrdersRepository,
            customersService,
        );
        res.status(200).send(result);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error });
    }
});

// hanldeAddOrderItem

export { ordersRouter };

