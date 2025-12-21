import axios from "axios";
//Models
import type { TaskModel } from "../models/task.model";
//Dto
import type { CreateTaskDto } from "../models/dto/task.dto";


const taskApi = axios.create({
    baseURL: import.meta.env.MODE === 'development'
    ? 'http://localhost:8000/api/v1'
    : 'https://gimnasioreactdjango.onrender.com/gym/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }, 
});

const handleApiError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
    }
    throw error;
};

export const CreateTask = async (task: CreateTaskDto ) => {
    try {
        const response = await taskApi.post<TaskModel>('/Task/', task);
        return response.data;
        
    } catch (error) {
        throw handleApiError(error);        
    }
}

export const ListTask = async (search: string = '', completed?:  boolean): Promise<TaskModel[]> => {
    try {
        const params:  { search?:  string; completed?: boolean } = {};
        
        // Solo agregar parámetros si tienen valor
        if (search. trim()) {
            params.search = search;
        }
        if (completed !== undefined) {
            params.completed = completed;
        }

        const response = await taskApi.get<TaskModel[]>('/Task/', {
            params:  params.search ? params : undefined
        });
        
        return response.data;
        
    } catch (error) {
        throw handleApiError(error);        
    }
};

export const GetTask = async (id: number): Promise<TaskModel> => {
    try {
        const response = await taskApi.get<TaskModel>(`/Task/${id}/`);
        return response.data;
        
    } catch (error) {
        throw handleApiError(error);        
    }
};

export const UpdateTask = async (id: number, task: CreateTaskDto): Promise<TaskModel> => {
    try {
        const response = await taskApi.put<TaskModel>(`/Task/${id}/`, task );
        return response.data;
        
    } catch (error) {
        throw handleApiError(error);       
    }    
}

export const DeleteTask = async (id: number): Promise<void> => {
    try {
        const response = await taskApi.delete(`/Task/${id}/`);
        //console.log('API Response:', response.data);
        
        return response.data;
        
    } catch (error) {
        throw handleApiError(error);        
    }    
}