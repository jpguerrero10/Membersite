const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const app = express();
const port = 3000;

// Ruta al archivo JSON
const filePath = path.join(__dirname, 'data.json');

// Middleware para analizar cuerpos JSON
app.use(express.json());

// Leer los datos del archivo JSON de manera asíncrona
const readData = async () => {
    try {
        const rawData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (err) {
        throw err;
    }
};

// Escribir datos en el archivo JSON de manera asíncrona
const writeData = async (data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 4));
    } catch (err) {
        throw err;
    }
};

// Configurar para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// rutas usuarios -------------------------------------------------------------------------------------------

// Obtener todos los usuarios
app.get('/users', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.users);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos del archivo' });
    }
});

// Obtener un usuario por ID
app.get('/users/:id', async (req, res) => {
    try {
        const data = await readData();
        const user = data.users.find(u => u.id === req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Agregar un nuevo usuario
app.post('/users', async (req, res) => {
    const newUser = req.body;
    try {
        const data = await readData();
        data.users.push(newUser);
        await writeData(data);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el usuario' });
    }
});

// Actualizar un usuario
app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
    try {
        const data = await readData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        data.users[userIndex] = { ...data.users[userIndex], ...updatedUser };
        await writeData(data);
        res.json(data.users[userIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

// Eliminar un usuario
app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const data = await readData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        data.users.splice(userIndex, 1);
        await writeData(data);
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// rutas tareas --------------------------------------------------------------------------------------------

// Obtener tareas
app.get('/tasks', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos del archivo' });
    }
});

// Obtener tareas asignadas a un usuario por su ID
app.get('/tasks/:userId', async (req, res) => {
    try {
        const data = await readData();
        const userId = req.params.userId.replace('@', ''); 
        const userTasks = data.tasks.filter(task => task.assignedUsers.includes(userId));
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// Agregar una nueva tarea
app.post('/tasks', async (req, res) => {
    try {
        const newTask = req.body;
        if (!newTask.title || !newTask.description || !newTask.deadline || newTask.isChecked === undefined) {
            return res.status(400).json({ error: 'Todos los campos de la tarea son requeridos' });
        }

        const data = await readData();
        data.tasks.push(newTask);
        await writeData(data);

        res.status(201).json({ message: 'タスクは作成された', task: newTask });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar la tarea' });
    }
});

// Actualizar una tarea por su título
app.put('/tasks/:title', async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title).trim();
        console.log('Título recibido:', title);

        const updatedTask = req.body;
        const data = await readData();
        const taskIndex = data.tasks.findIndex(task => task.title.trim() === title);

        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedTask };
        await writeData(data);
        
        res.json({ message: 'タスクはアップデートされた', task: data.tasks[taskIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

// Eliminar una tarea por su título
app.delete('/tasks/:title', async (req, res) => {
    try {
        const taskTitle = decodeURIComponent(req.params.title.trim());
        let data = await readData();

        const taskIndex = data.tasks.findIndex(task => task.title.trim() === taskTitle);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const deletedTask = data.tasks.splice(taskIndex, 1);
        await writeData(data);

        res.status(200).json({ message: 'Tarea eliminada exitosamente', task: deletedTask });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
