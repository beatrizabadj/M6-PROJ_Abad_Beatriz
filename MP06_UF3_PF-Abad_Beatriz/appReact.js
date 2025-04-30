// • Afegir i eliminar usuaris
// • Cada usuari té una llista de tasques
// • Cada llista permet afegir, editar, completar i eliminar tasques
// • Les tasques es tatxen condicionalment segons el seu estat (completades, pendents, etc.)
// • Hi ha un menú lateral que canvia dinàmicament segons l’usuari seleccionat, mostrant un resum de les tasques totals i completades de l’usuari.
// L’objectiu és recrear aquesta funcionalitat utilitzant React, organitzant la interfície i la lògica en una jerarquia de components amb una arquitectura clara i reutilitzable.


// Requisits Tècnics
// La versió en React ha d’incloure obligatòriament:
// 1.Jerarquia d’almenys tres nivells de components, amb flux de dades des del component arrel, utilitzant props i/o context de forma adequada. S’ha d’utilitzar obligatòriament Context en alguna ocasió (tot i que es recomana fer servir aquesta tècnica sempre, de manera prioritària).

// 2.Ús de JSX condicional per a:
// oMostrar contingut alternatiu quan la llista d’usuaris o de tasques estigui buida.
// oTatxar o no tatxar tasques segons el seu estat (pendent, completada).
// oMostrar al panell lateral esquerre informació sobre l’usuari (llista de tasques totals / completades) si hi ha un usuari seleccionat.

// 3.S’han d’utilitzar estats per a:
// oLa llista d’usuaris, cadascun amb la seva pròpia llista de tasques.
// oL’usuari seleccionat.
// oEl tema seleccionat (clar/fosc).
// oControlar el valor dels <input> per a la creació de nous usuaris i de noves tasques.

const { useState, useContext, useEffect, createContext } = React;
const { createRoot } = ReactDOM;

const app = document.querySelector('.app');
const root = ReactDOM.createRoot(app);
root.render(<App />);

// crear contexto para el tema
const ThemeContext = React.createContext();

// componente principal App
function App() {
    const [theme, setTheme] = React.useState('light');
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState('');

    const toggleTheme=()=>{
        setTheme((p)=>(p === 'light' ? 'dark' : 'light'));
    }
    React.useEffect(()=>{
        document.body.className = theme;
    }, [theme])
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
                <UserPanel
                    users={users}
                    setUsers={setUsers}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
                <TaskPanel
                    users={users}
                    setUsers={setUsers}
                    selectedUser={selectedUser}
                />
        </ThemeContext.Provider>
    );
}
// componente Task Panel
function UserPanel({ users, setUsers, selectedUser, setSelectedUser }) {

    const [newUser, setNewUser] = React.useState('');
    const { toggleTheme } = useContext(ThemeContext);
    const [index, setIndex] = React.useState(0);
    const [tasks, setTasks] = React.useState([]);
    const [isVisible, setIsVisible] = React.useState(false);

    function addUser() {
        if (newUser === '') {
            return;
        }
        // crear nuevo user
        const userObj = {
            id: index,
            name: newUser,
            tasks: []
        };

        // añadir obj a la lista users
        setUsers([
            ...users, 
            userObj
        ])

        setNewUser('');
        setIndex(p=>p+1);
    }

    function handleSelectUser(user) {
        setSelectedUser(user);
        setTasks(user.tasks); // mostrar tareas al seleccionar user
    
    }
    function deselectUser() {
        setSelectedUser('');
        setTasks([]); // limpiar tareas

    }

    function toggleVisibility() {
        setIsVisible(p=>!p);
    }

    return (

        <aside className="sidebar card">
            <h2>Usuarios</h2>
            <ul id = "userList" >
                {(
                    users.map(user=>(
                        <li key={user.id} onClick={() =>handleSelectUser(user)} style= {{cursor: 'pointer',fontWeight: 'bold'}}>
                            {user.name}
                        </li>
                    ))
                )}
            </ul>
            
            <input
                type="text"
                id="newUserInput"
                placeholder = "Nuevo usuario..."

                value={newUser}
                onChange={(e) =>setNewUser(e.target.value)}
            />
            <button onClick={addUser}>Añadir usuario</button>
            <div id="userInfo" className={selectedUser ? "" : "hidden"}>
                <hr />
                <p id="userName">{selectedUser.name}</p>
                <p id="userStats">Tareas: {users.find(p=>p.id === selectedUser.id) ?.tasks.filter(task =>task.completed).length} / {users.find(p=>p.id === selectedUser.id) ?.tasks.length} completadas</p>
                {/* llamar a dos funciones via una funcion anonima */}
                <button onClick={() => {deselectUser();toggleVisibility();}}>Deseleccionar</button>
            </div>
            
            <button onClick={toggleTheme} style={{ marginTop:'auto' }}>🌙/☀️ Tema</button>
        </aside>
    );
}

function TaskPanel({users, setUsers, selectedUser}) {
    
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    // sincronizar las tareas a cada usuario
    useEffect(()=> {
        if (selectedUser) {
            const user = users.find(p=>p.id === selectedUser.id);
            setTasks(user ? user.tasks : ([]));
        }
    }, [selectedUser, users]);

    function addTask() {
        if (newTask === '') {
            return;
        }
        const taskObj = {
            id: tasks.length,
            name: newTask,
            completed: false
        };

        const updatedTasks = [
            ...tasks,
            taskObj
        ];
        
        setTasks(updatedTasks);
        
        // actualizar usuario con las nuevas tareas
        setUsers(users.map(user => 
            user.id === selectedUser.id ? {
                ...user,
                tasks:updatedTasks 
            } : user
        ));

        setNewTask('');
    }

    // marcar tarea como completada o no en funcion del estado anterior
    function toggleTask(taskId) {
        const updatedTasks = tasks.map((task) =>
        task.id === taskId ? {
            ...task,
            completed:!task.completed
        }
            : task
        )
        setTasks(updatedTasks);

        // actualizar usuario con la tarea actualizada
        setUsers(users.map(user => 
            user.id === selectedUser.id ? {
                ...user,
                tasks:updatedTasks 
            } : user
        ));
    }

    // nueva lista sin la tarea
    function deleteTask(taskId) {
        setTasks(tasks.filter((task) => 
            task.id !== taskId
        ));
    }
    
    function editTask(taskId) {
        const newName = prompt(`Editar tarea:`);
        const taskToEdit = tasks.find(task=>task.id === taskId);

        if(newName !== null && newName.trim() != '' && newName !== taskToEdit.name) {
            setTasks(tasks.map((task) =>
                task.id === taskId ? {
                    ...task,
                    name: newName
                } : task ))
        }
    }
        return (
            <main className="main">
            <div className="card">
                <h1 id="mainTitle">{selectedUser ? `Tareas de ${selectedUser.name}` : "Selecciona un usuario"}</h1>
                <div id="taskSection" className={selectedUser ? "" : "hidden"}>
                    
                    <ul id="taskList">
                        {(
                            tasks.map(task=>(
                                <li key={task.id} className={task.completed ? "completed" : ""}>
                                    <span onClick={()=>toggleTask(task.id)}>{task.name}</span>
                                    <div className="actions">
                                        <button onClick={()=>editTask(task.id)}>
                                        ✏️
                                        </button>
                                        <button onClick={()=>deleteTask(task.id)}>
                                        🗑️
                                        </button>
                                    </div>                                
                                </li>
                            ))
                        )}
                    </ul>
                    <input
                        type="text" id="newTaskInput"
                        placeholder="Nueva tarea..."
                        value={newTask}
                        onChange={(e) =>setNewTask(e.target.value)}
                        />
                    <button onClick={addTask}>Añadir Tarea</button>
                </div>
            </div>
        </main>
        )
    }
