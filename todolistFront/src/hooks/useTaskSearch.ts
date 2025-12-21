import { useState, useRef, useEffect } from "react";
import { ListTask } from "../api/task.api";
//Model
import type { TaskModel } from "../models/task.model";
//Mensajes
import { toast } from "react-hot-toast";

export const useTaskSearch = () => {
    const [tasks, setTasks] = useState<TaskModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const isInitialized = useRef(false);

    // Función simple para cargar tareas
    const loadTasks = async (searchTerm: string = '') => {
        setIsLoading(true);
        try {
            const response = await ListTask(searchTerm);
            setTasks(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cargar las tareas';
            toast.error(errorMessage);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Manejar búsqueda con debounce
    const handleSearch = (searchValue: string) => {
        // Limpiar timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Si está vacío, cargar todas inmediatamente
        if (searchValue.trim() === '') {
            loadTasks('');
            return;
        }

        // Si tiene más de 2 caracteres, buscar con debounce
        if (searchValue.length > 2) {
            timeoutRef.current = setTimeout(() => {
                loadTasks(searchValue);
            }, 500);
        }
    };

    // Verificar si la tarea exacta ya existe
    const taskExistsExactly = (description: string): boolean => {
        return tasks. some(
            task => task.description. toLowerCase().trim() === description.toLowerCase().trim()
        );
    };

    // Cargar tareas iniciales UNA SOLA VEZ
    useEffect(() => {
        if (! isInitialized.current) {
            isInitialized.current = true;
            loadTasks('');
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        tasks,
        setTasks,
        isLoading,
        loadTasks,
        handleSearch,
        taskExistsExactly
    };
};