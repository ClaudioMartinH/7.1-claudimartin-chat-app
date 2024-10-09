<p align="center">
<br>
 <a href="" rel="noopener">
 <img width=200px height=200px src="https://media.giphy.com/media/tAjb5pyCEBhEb8jWxC/giphy.gif" alt="Project logo">
</a>
<h3  align="center" style="color: #00FF00;">Entrega 7.1 <br>Chat APP ITAcademy<br> por Claudio Martin</h3>

<div style="background-color: #333333; color: #D3D3D3; padding: 20px; border-radius: 10px;">

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v20.12.1-green)
![Express](https://img.shields.io/badge/Express-v4.19.2-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v5.0-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.7.5-yellow)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Google OAuth](https://img.shields.io/badge/Google-OAuth2-red)

## 🚀 Descripción

***Chat APP ITAcademy por Claudio Martin*** es una aplicación de chat en tiempo real construida con **Node.js, Express, MongoDB, Socket.IO y Google OAuth** para autenticación segura. Desarrollada íntegramente en ***Typescript***.<br> El frontend ha sido desarrollado con **Bootstrap, CSS y HTML**.<br> Es perfecta para aprender sobre desarrollo full-stack y como integrar diferentes tecnologías.<br> La entrega hace énfasis en el desarrollo de una API REST que integre un servidor Socket IO para permitir la comunicación en tiempo real con los demás usuarios, además de aplicar autenticación con JWT, Google OAUTH20, y poder ingresar como usuario invitado.<br> Como funcionalidades extra he desarrollado un buscador de usuarios conectados, salas de chat disponibles, y posibilidad de crear salas de chat a las que todos pueden unirse, y otras salas para conversaciones privadas solo accesibles para los 2 usuarios que la integren. Además, he aplicado tanto la función *debounce* para retardar el evento de busqueda de los inputs, asi como una función *throttle* para actualizar las listas de usuarios y salas disponibles. Y la persistencia de datos con mongoose. Así he podido integrar varias de las entregas anteriores del curso.<br>
Durante el registro de un usuario, he integrado **multer** para el manejo de la carga de fotos y su posterior utilización dentro de la app. <br>
No ha sido fácil, pero el resultado hace que haya valido la pena. Espero que os guste.

## 📚 Características

- **Mensajería en tiempo real** usando Socket.IO.
- **Autenticación segura** con JWT y Google OAuth.
- **Persistencia de datos** con MongoDB.
- **Interfaz de usuario intuitiva** con Bootstrap para una experiencia de usuario fluida.

## 🛠️ Instalación

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

#### Asegurate de tener NodeJs instalado en tu terminal, si no lo tienes pincha

[aqui](https://nodejs.org/en/download/package-manager/current)

```bash
# Clona el repositorio
git clone https://github.com/ClaudioMartinH/7.1-claudimartin-chat-app.git

# Instala las dependencias
npm run install

```

He creado comandos desde la raíz del proyecto para que se ejecute sin necesidad de navegar por las diferentes carpetas.
Una vez se hayan instalado las dependecias necesarias, incluso se copia el archivo ``.env`` de manera automatizada<br> Tan solo será necesario:

```bash
# Compilar el proyecto completo y copiar las variables de entorno en dist/
npm run build

# y finalmente, para ejecutar el servidor (index.js)
npm start
```
Necesitarás crear un archivo ``.env`` que contenga las siguientes variables:

```bash
MONGO_DB_URI=tu_string_de_conexion a mongodb
PORT=5050
JWT_SECRET=your_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Con estos sencillos comandos, una vez ejecutados uno a uno y en el orden establecido aquí,  tendremos el proyecto construido y funcionando pinchando el siguiente enlace:

[Ver página de inicio Chat-APP](http://localhost:5050)

## 📦 Tecnologías

- ***Node.js*** - Entorno de ejecución de JavaScript.
- ***Express*** - Framework minimalista para servidores web.
- ***MongoDB (mongoose)*** - Base de datos NoSQL para almacenar los mensajes y usuarios.
- ***Socket.IO*** - Librería para mensajería en tiempo real.
- ***JWT*** - Autenticación basada en JSON Web Tokens.
- ***Google OAuth*** - Autenticación a través de cuentas de Google.
- ***Bootstrap - CSS - HTMl*** para el frontend

## 💻 Rutas de la API

### Autenticación

POST /auth/google - Redirige a la página de inicio de sesión de Google OAuth.

GET /auth/google/callback - Callback de Google OAuth después de autenticarse.

### Usuarios

**GET** /api/users/all
Obtiene todos los usuarios registrados.

**GET** /api/users/search/id/:id
Obtiene un usuario por su ID.

**GET** /api/users/search/userName/:userName
Busca un usuario por su nombre de usuario.

**POST** /api/users/login
Autentica a un usuario existente mediante correo electrónico y contraseña.

**POST** /api/users/signup
Registra un nuevo usuario. Soporta la carga de una imagen de perfil.
Request Body: FormData (username, password, profilePic)

**POST** /api/users/guest-login
Autenticación como usuario invitado sin necesidad de registro.

**POST** /api/users/logout
Cierra sesión del usuario actual.

**PUT** /api/users/update/:id
Actualiza la información de un usuario por su ID.
Request Body: JSON con los campos a actualizar.

### Salas (Rooms)

Rutas para gestionar las salas de chat en la aplicación.

**GET** /rooms/all
Obtiene todas las salas de chat disponibles.

**POST** /rooms/create
Crea una nueva sala de chat.
Request Body: JSON con el nombre y descripción de la sala.

**GET** /rooms/id/:id
Obtiene una sala de chat por su ID.

**GET** /rooms/name/:name
Obtiene una sala de chat por su nombre.

**POST** /rooms/private
Crea una sala de conversación privada.
Request Body: JSON con los usuarios que participarán en la sala privada.

**DELETE** /api/users/delete/:id
Elimina un usuario por su ID.

### Mensajes

Rutas para gestionar los mensajes dentro de las salas y entre los usuarios.

**GET** /messages/all
Obtiene todos los mensajes de la aplicación.

**GET** /messages/rooms/messages/:name
Obtiene todos los mensajes de una sala por su nombre.

**GET** /messages/users/messages/:id
Obtiene todos los mensajes enviados por un usuario específico mediante su ID.

**POST** /messages/create
Crea un nuevo mensaje.
Request Body: JSON con el contenido del mensaje, ID de usuario y sala.

**DELETE** /messages/delete/:id
Elimina un mensaje por su ID.

**DELETE** /messages/users/delete/:id
Elimina todos los mensajes de un usuario específico.

## ☢️ Pruebas con Vitest

Para ejecutar las 9 suites de pruebas con más de 90 pruebas unitarias, utiliza el siguiente comando:

```bash
npm test
```

## THUNDER CLIENT

Se adjunta en carpeta ``/backend/requests`` las pruebas a los diferentes Endpoints de la API, además de algunas realizadas durante el desarrollo con **REST CLIENT**

## 🧙‍♂️ Fuentes de información

[midudev ASEGURA TU API CON JWT](https://www.youtube.com/watch?v=btW1SefZf9M&t=1028s)<br>
[midudev AUTENTICACIÓN JWT COOKIES](https://www.youtube.com/watch?v=UqnnhAZxRac&t=3505s)<br>
[midudev CHAT EN TIEMPO REAL](https://www.youtube.com/watch?v=WpbBhTx5R9Q&t=3623s)<br>
[falconmasters CURSO BOOTSTRAP](https://www.youtube.com/watch?v=LYubk9RXENk)<br>
[eduardo arias GOOGLE oAuth20](https://www.youtube.com/watch?v=aFCYHQCQC8w)<br>
[jon mircha CURSO DESARROLLO WEB NODEJS Y EXPRESS](https://www.youtube.com/watch?v=tDF644vI-gs&t=15128s)<br>

## 💬 Contacto

[Puedes escribirme pinchando este enlace](mailto:martinherranzc@gmail.com?subject=Hola)
