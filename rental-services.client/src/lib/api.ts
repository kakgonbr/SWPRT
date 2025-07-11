//using axios to fetch data from api
import axios from 'axios';
import type { VehicleModelDTO } from "./types.ts";
import type { Booking } from '../types/booking.ts';

const BASE_API_URL = '/api'

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

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
        const response = await axios.get(`/api/bikes/available`, { params: params });
        return response.data;
    }
};

export const rentalAPI = {
    createBooking: async (booking: Booking): Promise<string> => {
        try {
            console.log(`sending booking data ${booking}`);
            //const testBooking = {
            //    Id: '',
            //    CustomerId: 1,
            //    BikeName: 'Test Bike',
            //    BikeImageUrl: 'test.jpg',
            //    CustomerName: 'Test User',
            //    CustomerEmail: 'test@test.com',
            //    StartDate: '2024-01-15',
            //    EndDate: '2024-01-20',
            //    Status: 'Pending',
            //    PricePerDay: 50.00
            //};
            console.log(`converted booking data: ${booking.StartDate}`);
            const response = axios.post(`${BASE_API_URL}/rentals/book`, booking, {
                headers: {
                    'Content-type': 'application/json',
                    ...getAuthHeaders() 
                }
            });
            console.log(`create booking api response: ${response}`);
            return (await response).data;
        } catch (error) {
            console.error(`Error creating booking: ${error}`);
            throw error;
        }

    }
}