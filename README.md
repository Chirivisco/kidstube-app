# 🎥 KidsTube App

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 📝 Descripción

KidsTube App es la interfaz de usuario de una plataforma que permite a los padres controlar el contenido que sus hijos pueden ver. La aplicación proporciona una interfaz intuitiva para gestionar perfiles, videos y playlists, con un diseño amigable para niños.

### 🎯 Características Principales

- 👥 Sistema de perfiles múltiples
- 📺 Reproductor de video integrado
- 📋 Gestión de playlists
- 🎨 Interfaz amigable para niños
- 🔒 Sistema de autenticación seguro
- 📱 Diseño responsive

## 🛠️ Tecnologías Utilizadas

- **React.js** - Biblioteca de UI
- **React Router** - Navegación
- **React Bootstrap** - Componentes UI
- **Axios** - Cliente HTTP
- **React Hook Form** - Gestión de formularios
- **Shadcn UI** - Componentes adicionales

## 📁 Estructura del Proyecto

```
├── public/          # 🌐 Archivos estáticos
├── src/
│   ├── pages/      # 📄 Componentes de página
│   ├── css/        # 🎨 Estilos CSS
│   ├── Middleware/ # 🔄 Middleware de la aplicación
│   ├── App.js      # 🚀 Componente principal
│   └── index.js    # ⚡ Punto de entrada
└── package.json    # 📦 Dependencias y scripts
```

## ⚙️ Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Chirivisco/kidstube-app.git
cd kidstube-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar la aplicación:**
```bash
npm start
```

## 📱 Páginas Principales

### 🔐 Autenticación
- **LoginSignUp**: Página de inicio de sesión y registro
  - Formulario de registro
  - Formulario de inicio de sesión
  - Validación de datos

### 👥 Perfiles
- **Profile_selec**: Selección de perfil
  - Lista de perfiles disponibles
  - Creación de nuevo perfil
  - Selección de tipo de perfil

- **Main_profile_dashboard**: Dashboard principal
  - Vista general de contenido
  - Acceso rápido a videos
  - Gestión de preferencias

- **Restricted_profile_dashboard**: Dashboard para perfiles restringidos
  - Contenido limitado
  - Interfaz simplificada
  - Controles parentales

- **Profile_data**: Gestión de datos de perfil
  - Edición de información
  - Configuración de preferencias
  - Gestión de seguridad

### 📺 Gestión de Contenido
- **Update_playlist**: Gestión de playlists
  - Creación de playlists
  - Edición de contenido
  - Organización de videos

## 🎨 Características de UI/UX

- 🎯 Diseño intuitivo y amigable
- 📱 Interfaz responsive
- 🎨 Tema adaptado para niños
- ⚡ Navegación fluida
- 🔍 Búsqueda eficiente
- 🎮 Controles simplificados

## 🔒 Seguridad

- 🔐 Integración con JWT
- 🛡️ Protección de rutas
- 🔑 Manejo seguro de datos
- 👤 Validación de permisos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Chirivisco** - *Trabajo Inicial* - [Chirivisco](https://github.com/Chirivisco)

## 🙏 Agradecimientos

- React por su excelente biblioteca de UI
- Bootstrap por sus componentes estilizados
- La comunidad de React por sus valiosas herramientas
