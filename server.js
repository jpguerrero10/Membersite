const express = require('express');
const multer = require("multer");
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const os = require('os'); //

const app = express();
const port = 3000;

// Función para obtener la IP local automáticamente
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address; // Retorna la IP de la red local
            }
        }
    }
    return 'localhost'; // En caso de fallo, usa localhost
};

// Ruta al archivo JSON
const filePath = path.join(__dirname, 'data.json');

// Middleware para analizar cuerpos JSON
app.use(express.json());
app.use(cors());

// read and rewrite json
const readData = async () => {
    try {
        const rawData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (err) {
        throw err;
    }
};

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

// ---------------------------------------------------------------- rutas/routes -----------------------------------------------------------
// Ruta para obtener la IP local del servidor
app.get('/get-server-ip', (req, res) => {
    res.json({ ip: localIP });
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

async function updateItem(collection, id ,newData) {
    const data = await readData();
    const itemIndex = data[collection].findIndex(item => String(item.id) === String(id));
    if (itemIndex === -1) {
        throw new Error('Item not found');
    }
    data[collection][itemIndex] = {...data[collection][itemIndex], ...newData};
    await writeData(data);
    return data[collection][itemIndex];
}

//ユーザー情報の特定のプロパティのみを更新
app.patch('/users/:id/', async(req, res) => {
    console.log(req.params.id);
    try {
        const updatedUser = await updateItem('users', req.params.id, req.body);
        res.json({message: 'Usuario actualizado', user: updatedUser});
    } catch (error) {
        res.status(404).json({error: error.message});
    }
});

// task route // rutas tareas --------------------------------------------------------------------------------------------

// get task // Obtener tareas
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
app.put('/tasks/:id', async (req, res) => {
    try {
        const id = decodeURIComponent(req.params.id).trim();
        console.log('id recibido:', id);

        const updatedTask = req.body;
        const data = await readData();
        const taskIndex = data.tasks.findIndex(task => task.id.trim() === id);

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
app.delete('/tasks/:id', async (req, res) => {
    try {
        const taskid = decodeURIComponent(req.params.id.trim());
        let data = await readData();

        const taskIndex = data.tasks.findIndex(task => task.id.trim() === taskid);
        
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

// rutas eventos -------------------------------------------------------------------------------

// Ruta para obtener eventos
app.get('/events', async (req, res) => {
    try {
        const data = await readData(); // Leer el archivo JSON
        res.json(data.events); // Enviar solo los eventos
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los eventos' });
    }
});
app.get('/events/:userId', async (req, res) => {
    try {
        const data = await readData();
        const userId = req.params.userId.replace('@', ''); 
        const userTasks = data.events.filter(event => event.assignedUsers.includes(userId));
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});
// ruta para crear eventos
app.post('/events', async (req, res) => {
    try {
        const { 
            assignedUsers, 
            title, 
            start, 
            end,
            place, 
            content,
            type,
            interval,
            endDate 
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'El título, la fecha de inicio y la fecha de fin son obligatorios.' });
        }

        const data = await readData(); // Leer eventos actuales

        const recurrenceData = (type || interval || endDate) ? { type, interval, endDate } : null;

        // Crear el nuevo evento con todos los posibles datos
        const newEvent = {
            title,
            start,
            end,
            assignedUsers: assignedUsers || [],
            ...(place && { place }),
            ...(content && { content }),
            ...(recurrenceData && { recurrence: recurrenceData })
        };

        data.events.push(newEvent); // Agregar el evento

        await writeData(data); // Guardar cambios en JSON

        res.status(201).json({ message: 'Evento creado con éxito', event: newEvent });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el evento' });
    }
});

// project route --------------------------------------------------------------------------------------------

// get project
app.get('/projects', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.projects);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos del archivo' });
    }
});

// 画像の保存に関する処理
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "img/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

app.post("/upload",
    upload.single("image"), (req, res) => {
    try {
        console.log('アップロードされたファイル:', req.file)
        if (!req.file) {
            return res.status(400).json({error: "画像がアップロードされていません"});
        }
        res.json({
            message: "画像のアップロードに成功しました",
            filePath: `/img/${req.file.filename}`
        });
    } catch (error) {
        console.error('アップロード処理中にエラー:', error);
        res.status(500).json({error: "サーバー内部エラー"});
    }
});

app.use("/img",
    express.static("img")
);

//---------------------------------------------------------- server starts ------------------------------------------------------------------

// Obtener IP al iniciar
const localIP = getLocalIP();

// server init/Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://${localIP}:${port}`);
});
