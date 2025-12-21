//estados
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
//form
import { useForm } from "react-hook-form";
//Api
import { CreateTask, GetTask, UpdateTask } from "../api/task.api";
//Model
import type { TaskModel } from "../models/task.model";
//Mensajes
import { toast } from "react-hot-toast";
//img
import Logo from '../../public/favicon-32x32.png';

interface CreateTasksProps {
    onSearch: (searchValue: string) => void;
    onTaskCreated: (search?:  string) => Promise<void>;
    taskExistsExactly: (description:  string) => boolean;    
}

const CreateTasks = ({ onSearch, onTaskCreated, taskExistsExactly }: CreateTasksProps) => {
    const params = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<TaskModel>();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [showCreateButton, setShowCreateButton] = useState(true);
    const duplicateCheckTimeoutRef = useRef<number | null>(null);
    const searchTimeoutRef = useRef<number | null>(null);
    
    // Usar refs para evitar dependencias
    const onSearchRef = useRef(onSearch);
    const taskExistsRef = useRef(taskExistsExactly);
    
    // Actualizar refs cuando cambien (pero no causa re-renders)
    useEffect(() => {
        onSearchRef. current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        taskExistsRef.current = taskExistsExactly;
    }, [taskExistsExactly]);
    
    // Observar el valor del input
    const descriptionValue = watch('description', '');

    useEffect(() => {
        // Si estamos en modo edición, no buscar
        if (params. id) {
            setIsSearchMode(false);
            setShowCreateButton(false);
            setIsDuplicate(false);
            return;
        }

        // Si está vacío, mostrar botón para crear
        if (descriptionValue.trim() === '') {
            onSearchRef.current('');
            setIsSearchMode(false);
            setShowCreateButton(true);
            setIsDuplicate(false);

            // Limpiar timeouts
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (duplicateCheckTimeoutRef.current) clearTimeout(duplicateCheckTimeoutRef. current);
            return;
        }

        // Si tiene más de 2 caracteres, buscar
        if (descriptionValue.length > 2) {
            setIsSearchMode(true);
            setShowCreateButton(true);

            // Limpiar timeout de búsqueda anterior
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

            // Realizar búsqueda con debounce
            searchTimeoutRef.current = setTimeout(() => {
                onSearchRef.current(descriptionValue);

                // Limpiar timeout de duplicado anterior
                if (duplicateCheckTimeoutRef.current) {
                    clearTimeout(duplicateCheckTimeoutRef.current);
                }

                // Verificar duplicados después de que la búsqueda termine
                duplicateCheckTimeoutRef.current = setTimeout(() => {
                    const exists = taskExistsRef. current(descriptionValue);
                    setIsDuplicate(exists);
                    setIsSearchMode(false);
                }, 600);
            }, 500);
        } else {
            setIsSearchMode(false);
            setShowCreateButton(true);
            setIsDuplicate(false);

            // Limpiar timeouts
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            if (duplicateCheckTimeoutRef.current) clearTimeout(duplicateCheckTimeoutRef.current);
        }

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef. current);
            if (duplicateCheckTimeoutRef.current) clearTimeout(duplicateCheckTimeoutRef.current);
        };
    }, [descriptionValue, params.id]); // ← SIN taskExistsExactly ni onSearch

    const onSubmit = handleSubmit(async (data:  TaskModel) => {
        // Si es un duplicado exacto y estamos creando (no editando), bloquear
        if (isDuplicate && !params.id) {
            toast.error('Esta tarea ya existe. No se pueden crear duplicados.', {
                duration: 3000,
                position: 'bottom-right',
                style: {
                    background: '#dc2626',
                    color:  '#fff',
                    padding: '16px',
                    borderRadius:  '8px',
                },
            });
            return;
        }

        try {
            const requestData = {
                description: data.description,
                completed: data.completed || false
            };

            if (params. id) {
                // Modo edición
                await UpdateTask(parseInt(params.id), requestData);
                toast.success('Tarea Actualizada', {
                    duration: 3000,
                    position: 'bottom-right',
                    style: {
                        background: '#4b5563',
                        color:  '#fff',
                        padding:  '16px',
                        borderRadius: '8px',
                    },
                });
                navigate('/');
            } else {
                // Modo creación
                await CreateTask(requestData);
                reset();
                toast.success('Tarea Creada', {
                    duration: 3000,
                    position: 'bottom-right',
                    style:  {
                        background: '#4b5563',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                    },
                });
                setIsSearchMode(false);
                setIsDuplicate(false);
            }

            // Recargar lista de tareas
            await onTaskCreated();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al registrar la tarea';
            toast.error(errorMessage, {
                duration: 3000,
                position: 'bottom-right',
            });
        }
    });

    // Cargar datos si estamos editando
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (params.id) {
                    const response = await GetTask(parseInt(params.id));
                    reset(response);
                }
            } catch (error) {
                console.error('Error al obtener la tarea', error);
                toast.error('Error al cargar la tarea para edición');
            }
        };
        fetchUserData();
    }, [params.id, reset]);

    return (
        <main className="w-full flex flex-col p-2">
            <div className="w-full flex justify-center pb-10">
                <h1 className="flex items-center text-center text-2xl md:text-4xl">
                    <img className='w-9 h-7 rounded-lg mr-3' src={Logo} alt="Logo" />
                    ToDo <span className="text-green-400">List</span>
                </h1>
            </div>

            <form
                onSubmit={onSubmit}
                className="w-full flex flex-col gap-6 md:flex-row md:items-center md:pb-8 relative">
                <label htmlFor="description" className="w-full relative">
                    <input
                        type="text"
                        className={`w-full p-2 border-solid border-b-2 outline-none text-lg md:text-xl md:px-0 transition-colors ${
                            isDuplicate && descriptionValue.length > 0
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-400'
                        }`}
                        placeholder={params.id ? 'editar tarea' : 'Buscar o agregar tarea'}
                        {... register('description', {
                            required: params.id ? true : false,
                            minLength: {
                                value: params.id ? 3 : 1,
                                message: 'La tarea debe tener como mínimo 3 caracteres'
                            },
                            maxLength: {
                                value: 50,
                                message: 'La tarea debe tener como máximo 50 caracteres'
                            },
                            pattern: {
                                value: /^[a-zA-Z\s]+$/,
                                message: 'Tarea inválida'
                            },
                        })}
                    />

                    {/* Indicador de búsqueda/duplicado */}
                    {descriptionValue.length > 0 && (
                        <div className="absolute right-12 top-2 flex items-center space-x-2">
                            {isSearchMode && ! isDuplicate && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded animate-pulse">
                                    Buscando...
                                </span>
                            )}
                            {!isSearchMode && ! isDuplicate && descriptionValue.length > 2 && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                    Nueva tarea
                                </span>
                            )}
                            {isDuplicate && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">
                                    ⚠️ Ya existe
                                </span>
                            )}
                        </div>
                    )}

                    {/* Icono de búsqueda/creación/duplicado */}
                    <div className="absolute right-2 top-3 text-gray-400 text-lg">
                        {isDuplicate ?  '❌' : isSearchMode ? '🔍' : '➕'}
                    </div>
                </label>

                {errors.description && (
                    <span className='text-red-500 text-sm'>{errors. description.message}</span>
                )}

                {isDuplicate && descriptionValue.length > 0 && ! params.id && (
                    <span className='text-red-600 text-sm font-semibold'>
                        ⚠️ Esta tarea ya existe. No se pueden crear duplicados.
                    </span>
                )}

                {showCreateButton && (
                    <div className="w-full flex justify-center pb-6 md:pb-0 md:justify-end md:w-96">
                        <button
                            type="submit"
                            disabled={isDuplicate && !params.id}
                            className={`w-48 font-bold rounded-2xl p-2 cursor-pointer text-lg md:text-xl transition-all duration-200 ${
                                isDuplicate && !params.id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                    :  'bg-green-200 hover:bg-green-600 hover:text-gray-100'
                            }`}
                        >
                            {params.id ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                )}
            </form>
        </main>
    );
};
export default CreateTasks;