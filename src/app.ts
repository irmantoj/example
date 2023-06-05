import express from "express";
import cors from "cors";
import { ordersRouter } from "./routes/orders";

export const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.use(ordersRouter);
    

    app.all("*", (req, res) => {
        res.sendStatus(404);
    });

    return app;
}