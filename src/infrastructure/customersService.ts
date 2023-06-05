import axios from "axios";
import { ICustomersService, TCustomer } from "../core/types";

const getById = async (customerId: string): Promise<TCustomer | null> => {
    try {
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${customerId}`);
        const { id, name, email } = data;
        return { id: id.toString(), name, email }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null
        }
        throw error;
    }
}

export const customersService: ICustomersService = {
    getById,
}