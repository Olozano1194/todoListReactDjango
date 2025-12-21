//estados
import { useState } from "react";
//API
import { DeleteTask, UpdateTask } from "../api/task.api";
//Enlaces
import { Link } from "react-router-dom";
//Mensajes
import { toast } from 'react-hot-toast';
//Models
import type { TaskModel } from "../models/task.model";
//Icons
import { RiDeleteBinLine, RiPencilLine } from "react-icons/ri";

interface ListTasksProps {
    tasks: TaskModel[];
    isLoading: boolean;
    onTasksChange: (tasks: TaskModel[]) => void;
}

const ListTasks = ({ tasks, isLoading, onTasksChange }: ListTasksProps) => {
    const [_, setDeletingId] = useState<number | null>(null);


    //Función para el manejo de la eliminación
    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta tarea?')){
            setDeletingId(id);
            try {
                await DeleteTask(id);
                onTasksChange(tasks.filter(task => task.id !== id));
                toast.success('Tarea Eliminada', {
                    duration: 3000,
                    position: 'bottom-right',
                    style: {
                        background: '#4b5563',   // Fondo negro
                        color: '#fff',           // Texto blanco
                        padding: '16px',
                        borderRadius: '8px',
                    },
                });   
            } catch (error) {
                   const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la tarea';
                    toast.error(errorMessage);                                    
            } finally {
                setDeletingId(null);
            }
        }
    };

    //Función para el completado
    const handleToggleComplete = async (task: TaskModel) => {
        try {
            const updatedTask = { ...task, completed: !task.completed};

            //Actualizamos en el back
            await UpdateTask(task.id, updatedTask);

            //Actualizamos el estado local
            onTasksChange(
                tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t )
            );
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la tarea';
            toast.error(errorMessage);            
        }
    };
    const pendingTasks = tasks.filter(task => !task.completed).length;

    return (
        <main className="w-full grid grid-cols-1 auto-rows-auto max-h-[400px] overflow-y-auto p-2 text-lg md:text-xl xl:text-2xl">
            {/* Contador de tareas pendientes */}
            {tasks.length > 0 && (
                <div className="mb-4.5 pb-4 border-b border-gray-300">
                    <p>
                        Te quedan <span className="font-bold text-xl text-green-500 md:text-2xl">{pendingTasks}</span> tareas por hacer
                    </p>
                </div>
            )}
            {/* Lista de tareas */}
            { 
                Array.isArray(tasks) && tasks.map((task) => (
                    <form key={task.id} className="w-full flex justify-between">                
                        <label 
                            htmlFor={`task-${task.id}`} 
                            className={`cursor-pointer flex gap-2 items-center transition-all duration-300 ${
                                task.completed
                                    ? 'line-through text-gray-500 opacity-75'
                                    : 'text-current opacity-100'
                            }`}
                        >
                            <input 
                                type="checkbox"
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)} 
                                className="appearance-none w-3 h-3 border border-gray-600 rounded-full checked:bg-green-500 checked:border-transparent relative"
                            />
                            {task.description}
                        </label>
                        {/* btn */}
                        <section className="w-[30%] cursor-pointer flex justify-end items-center gap-2 text-xl md:text-2xl">
                            <Link to={`/Task/${task.id}`} className="text-green-600 hover:scale-125 hover:text-green-800"><RiPencilLine /></Link>
                            <button 
                                onClick={() => handleDelete(task.id)}
                                className="text-red-600 hover:text-red-700 hover:scale-125"
                            >   
                                <RiDeleteBinLine />
                            </button>
                        </section>
                    </form> 
                ))
            }
            {/* Estados de carga/vacío */}
            {isLoading && <div className="text-center py-4"><div className="animate-spin inline-block">⏳</div>Buscando tarea...</div> }

            { !isLoading && tasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">No hay tareas disponibles</div>
            )}            
        </main>        
    );
};
export default ListTasks;