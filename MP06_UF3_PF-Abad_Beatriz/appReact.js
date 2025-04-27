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
const { useState } = React;

const app = document.querySelector('.app');
const root = ReactDOM.createRoot(app);
root.render(<App />);


// crear contexto para el tema
const themeContext = React.createContext();

// componente principal App
function App() {
    const [theme, setTheme] = React.useState('light');
    const toggleTheme=()=>{
        setTheme((p)=>(p === 'light' ? 'dark' : 'light'));
    
    }
    return (
        <themeContext.Provider value={{theme, toggleTheme}}>
            <UserPanel/>
            {/* <TaskPanel/> */}
        </themeContext.Provider>
    )
}
// componente Task Panel
function UserPanel() {
    // lista users
    const [users, setUsers] = React.useState([]);
    const [newUser, setNewUser] = React.useState('');
    const [selectedUser, setSelectUser] = React.useState('');
    const [index, setIndex] = React.useState(0);
    const {theme, toggleTheme} = React.useContext(themeContext);
    const [tasks, setTasks] = React.useState([]);
    const [selectedTask, setSelectTask] = React.useState('');
    const [newTask, setNewTask] = React.useState('');
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
        setSelectUser(user);
        setTasks(user.tasks); // mostrar tareas al seleccionar user
    
    }
    function deselectUser() {
        setSelectUser('');
        setTasks([]); // limpiar tareas

    }

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
        setTasks(tasks.map((task) => 
            task.id === taskId ? {
                ...task,
                completed:!task.completed}
            : task
        )
    )}

    // nueva lista sin la tarea
    function deleteTask(taskId) {
        setTasks(tasks.filter((task) => 
            task.id !== taskId
        ));
    }
    
    function editTask(taskId) {
        alert(`Editar tarea:`)
        setTasks(tasks.map((task) =>
        task.id === taskId ? {
            ...task,
            name: newTask
        } : task ))
    }
    function toggleVisibility() {
        setIsVisible(p=>!p);
    }
    function handleSelectTask(task) {
        setSelectTask(task);
    
    }
    function deselectTask() {
        setSelectTask('');

    }
    return (
        <div className="app">
        <aside className="sidebar card">
            <h2>Usuarios</h2>
            
            <ul id = "userList">
                {(
                        users.map(user=>(
                            <li key={user.id}>
                                <p id="userName" onClick={() =>handleSelectUser(user)}>{user.name}</p>
                                {selectedUser?.id === user.id && (
                            <button onClick={() =>deselectUser()}>
                                Deseleccionar
                            </button>
                        )}
                                
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
                <p id="userStats">Tareas: {tasks.length} / {tasks.filter(task =>task.completed).length} completadas</p>
                {/* llamar a dos funciones via una funcion anonima */}
                <button onClick={() => {deselectUser();toggleVisibility();}}>Deseleccionar</button>
            </div>
            
            <button onClick={toggleTheme} style={{ marginTop:'auto' }}>🌙/☀️ Tema</button>
        </aside>
        <main className="main">
            <div className="card">
                <h1 id="mainTitle">{selectedUser ? `Tareas de ${selectedUser.name}` : "Selecciona un usuario"}</h1>
                <div id="taskSection" className={selectedUser ? "" : "hidden"}>
                    
                    <ul id="taskList">
                    {(
                        tasks.map(task=>(
                            <li  key={task.id}>
                                <span className={task.completed ? "completed" : ""}  onClick={()=>toggleTask(task.id)}>{task.name}</span>
                                <div className="actions">
                                <button onClick={()=>deleteTask(task.id)}>
                                        Borrar
                                    </button>
                                    <button onClick={()=>editTask(task.id)}>
                                        Editar
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
        </div>
    );
}

