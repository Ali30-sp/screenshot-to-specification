import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialEmployees, initialTasks, type Employee, type Task } from './model';
const Context=createContext<{employees:Employee[];setEmployees:React.Dispatch<React.SetStateAction<Employee[]>>;tasks:Task[];setTasks:React.Dispatch<React.SetStateAction<Task[]>>}|null>(null);
export function HRProvider({children}:{children:ReactNode}) { const [employees,setEmployees]=useState(initialEmployees);const [tasks,setTasks]=useState(initialTasks);return <Context.Provider value={{employees,setEmployees,tasks,setTasks}}>{children}</Context.Provider>; }
export function useHR(){const ctx=useContext(Context);if(!ctx)throw new Error('HR provider is required');return ctx;}
