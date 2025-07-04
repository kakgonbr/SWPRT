﻿//using axios to fetch data from api
import axios from 'axios';
import type {VehicleModelDTO} from "./types.ts";

const BASE_API_URL = '/api'
export const bikeApi = {
    //TODO: the Bikes in URL may needed to be changed when routing with react component
    getAllBikes: async (): Promise<VehicleModelDTO[]> => {
        const response = await axios.get(`${BASE_API_URL}/bikes`);
        return response.data;
    },

    getBikeById: async (id: number): Promise<VehicleModelDTO> => {
        const response = await axios.get(`${BASE_API_URL}/bikes/${id}`);
        return response.data;
    },

    getAvailableBike: async (startDate: string, endDate: string, address?: string, searchTerm?: string): Promise<VehicleModelDTO[]> => {
        const params: Record<string, string> = {
            startDate,
            endDate,
        }
        if (address !== undefined) {
            params.address = address;
        }
        if (searchTerm !== undefined) {
            params.searchTerm = searchTerm;
        }
        const response = await axios.get(`/api/bikes/available`, {params: params});
        return response.data;
    }
}