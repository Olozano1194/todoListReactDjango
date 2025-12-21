import { useTaskSearch } from '../hooks/useTaskSearch';
import CreateTasks from "./CreateTask";
import ListTasks from "./ListTask";

const Task = () => {
    const { tasks, setTasks, isLoading, loadTasks, handleSearch, taskExistsExactly } = useTaskSearch();

    return (
        <main className="w-full flex flex-col justify-center items-center py-6 px-4 bg-gray-100 rounded-xl md:px-8">
            <CreateTasks
                onSearch={handleSearch}
                onTaskCreated={loadTasks} 
                taskExistsExactly={taskExistsExactly}
            />
            <ListTasks 
                tasks={tasks}
                isLoading={isLoading}
                onTasksChange={setTasks}
            />
        </main>
    );
};

export default Task;