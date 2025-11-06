# 🎮 Playfull Learning

**Plataforma educativa gamificada para gestión académica y recompensas estudiantiles**

## 📖 Descripción

**Playfull Learning** es una plataforma web integral que transforma la gestión educativa mediante la gamificación. Permite a instituciones educativas gestionar estudiantes, profesores, clases y evaluaciones, mientras motiva a los estudiantes con un sistema de recompensas basado en monedas virtuales.

### 🎯 Objetivos

- ✅ Facilitar la gestión académica institucional
- ✅ Gamificar el proceso de aprendizaje
- ✅ Centralizar información de estudiantes, docentes y clases
- ✅ Motivar a estudiantes mediante sistema de recompensas
- ✅ Proporcionar herramientas administrativas eficientes

---

## ✨ Características

### 👨‍💼 Para Administradores
- 📊 Dashboard con estadísticas globales
- 👥 Gestión completa de usuarios (profesores, secretarias, estudiantes)
- 🏫 Administración de colegios
- 🏆 Gestión de premios y recompensas
- 📚 Asignación de clases a profesores
- 📈 Reportes y analytics

### 📋 Para Secretarias
- 📝 Registro masivo de estudiantes
- 📢 Gestión de anuncios institucionales
- 👀 Vista de estudiantes por grado
- 📊 Estadísticas del colegio
- 🔍 Filtros y búsqueda avanzada

### 👨‍🏫 Para Profesores
- 📚 Gestión de clases asignadas
- 🎯 Asignación de monedas a estudiantes
- 💬 Retroalimentación personalizada
- 📝 Registro de calificaciones
- 📊 Seguimiento académico

### 🎓 Para Estudiantes
- 📖 Vista de clases inscritas
- 💰 Monedas acumuladas
- 🏆 Catálogo de premios
- 🎁 Canje de recompensas
- 📈 Historial académico
- 💭 Retroalimentación recibida

---

## 🚀 Instalación

### Requisitos Previos

```bash
Node.js >= 18.x
MySQL >= 8.0
npm 
Git
```

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/obandsalex06/PLAYFULL_LEARNING.git
cd PLAYFULL_LEARNING
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de MySQL
nano .env
```

**Configuración del archivo `.env`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=playfull_learning
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
PORT=5000
NODE_ENV=development
```

```bash
# Inicializar base de datos
npm run db:init

# (Opcional) Poblar con datos de prueba
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en: `http://localhost:5000`

### 3️⃣ Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en: `http://localhost:5174`

---

## 🖥️ Uso

### Usuarios de Prueba

Después de ejecutar `npm run seed`, puedes usar:

**Administrador:**
```
Email: lobandoalex@gmail.com
Password: Duvertynoob45
```

**Profesor:**
```
Email: Luz@gmail.com
Password: Luz12345@
```

**Secretaria:**
```
Email: Mile@gmail.com
Password: Milena12345@
```

**Estudiante:**
```
Email: Rogelio@gmail.com
Password: Rogelio11@
```

### Scripts Disponibles

#### Backend
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run db:init  # Inicializar base de datos
npm run seed     # Poblar datos de prueba
```

#### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Compilar para producción
npm run preview  # Preview de producción
npm run lint     # Ejecutar linter
```

---

## 💻 Tecnologías

### Frontend
- ⚛️ **React 19.1.1** - UI Library
- ⚡ **Vite 7.1.2** - Build Tool
- 🎨 **Tailwind CSS 4.1.13** - CSS Framework
- 🧭 **React Router 7.8.2** - Routing
- 📡 **Axios 1.12.2** - HTTP Client
- 🎯 **Lucide React** - Icon Library

### Backend
- 🟢 **Node.js 24.8.0** - Runtime
- 🚂 **Express 4.19.2** - Web Framework
- 🔐 **JSON Web Tokens** - Authentication
- 🔒 **bcryptjs** - Password Hashing
- 🚦 **express-rate-limit** - Rate Limiting
- 🌐 **CORS** - Cross-Origin Support

### Base de Datos
- 🗄️ **MySQL 8.0** - Relational Database
- 📦 **mysql2** - MySQL Driver

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + Tailwind CSS + React Router                 │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │Secretary │  │ Teacher  │  │ Student  │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│                    ↓ Axios + JWT ↓                          │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│         Node.js + Express + JWT Middleware                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes: Auth | Academic | Feedback | Student        │  │
│  │  Middleware: authenticateToken | authorizeRoles      │  │
│  │  Utils: JWT Generation & Verification                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                    ↓ mysql2 ↓                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                        │
│                                                              │
│  Schools ← Admins, Teachers, Secretaries, Students, Classes │
│  Classes ← Evidences, Feedback, Academic Records            │
│  Students ← Coins, Redeemed Rewards                         │
│  Rewards ← Redeemed Rewards                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Proyecto

```
PLAYFULL_LEARNING/
│
├── backend/
│   ├── config/
│   │   ├── db.js                 # Conexión MySQL
│   │   └── schema.sql            # Esquema de base de datos
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.js         # Autenticación y usuarios
│   │   ├── feedbackRoutes.js     # Retroalimentación
│   │   ├── academicRoutes.js     # Registros académicos
│   │   ├── studentRoutes.js      # Rutas de estudiantes
│   │   └── announcementRoutes.js # Anuncios
│   ├── scripts/
│   │   ├── init_db_from_schema.js
│   │   └── seed_sample_data.js
│   ├── utils/
│   │   └── jwtUtils.js           # JWT utilities
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/               # Imágenes y recursos
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── navbar/           # Navbars por rol
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Context API
│   │   ├── layouts/              # Layouts de página
│   │   ├── pages/                # Páginas principales
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── SecretaryDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── api.js                # Axios client
│   │   ├── main.jsx              # Entry point
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── DOCUMENTACION_PROYECTO_PLAYFULL_LEARNING.md
```

---

## 🔐 Seguridad

### Autenticación JWT
- **Access Token**: 15 minutos de duración
- **Refresh Token**: 7 días de duración
- **Renovación automática** de tokens expirados
- **Rate Limiting**: 5 intentos de login por 15 minutos

### Protección de Datos
- ✅ Contraseñas hasheadas con bcryptjs (10 rounds)
- ✅ JWT con firma secreta
- ✅ CORS configurado con allowlist
- ✅ Middleware de autorización por roles
- ✅ Validación de inputs en frontend y backend

---

## 🗄️ Base de Datos

### Tablas Principales

- **schools** - Instituciones educativas
- **admins** - Administradores del sistema
- **teachers** - Profesores
- **secretaries** - Personal administrativo
- **students** - Estudiantes
- **classes** - Clases/Materias
- **evidences** - Evidencias de tareas
- **feedback** - Retroalimentación docente
- **academic_records** - Registros de calificaciones
- **rewards** - Premios disponibles
- **redeemed_rewards** - Premios canjeados
- **coins** - Historial de monedas
- **announcements** - Anuncios institucionales
- **consents** - Consentimientos legales

### Diagrama ER Simplificado

```
schools (1:N) → admins, teachers, secretaries, students, classes
teachers (1:N) → classes, feedback
students (N:M) → classes (through class_students)
students (1:N) → evidences, coins, redeemed_rewards
classes (1:N) → evidences, feedback, academic_records
rewards (1:N) → redeemed_rewards
```

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh-token` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/register-*` - Registrar usuarios

### Gestión
- `GET /api/auth/teachers` - Listar profesores
- `GET /api/auth/all-students` - Listar estudiantes (paginado)
- `GET /api/auth/all-classes` - Listar clases
- `GET /api/auth/schools` - Listar colegios
- `GET /api/auth/rewards` - Listar premios

### Sistema de Recompensas
- `POST /api/auth/assign-coins` - Asignar monedas
- `POST /api/auth/redeem-reward` - Canjear premio

### Académico
- `POST /api/feedback/` - Crear retroalimentación
- `POST /api/academic/records` - Crear registro académico
- `GET /api/academic/records/student/:id` - Registros de estudiante

📄 **Ver documentación completa de API**: [DOCUMENTACION_PROYECTO_PLAYFULL_LEARNING.md](./DOCUMENTACION_PROYECTO_PLAYFULL_LEARNING.md)

---

## 🎨 Características UX/UI

### Componentes Reutilizables
- 🔔 **Toast Notifications** - Feedback visual con auto-dismiss
- 📄 **Pagination** - Navegación de tablas responsive
- ⚠️ **Confirm Modal** - Confirmación de acciones destructivas
- 🍞 **Breadcrumbs** - Navegación contextual
- 🔒 **Protected Routes** - Control de acceso por rol

### Mejoras UX
- ✅ Loading spinners en operaciones asíncronas
- ✅ Validación inline de formularios
- ✅ Placeholders descriptivos
- ✅ Estados disabled durante carga
- ✅ Feedback inmediato de acciones
- ✅ Diseño responsive (mobile-first)

---

## 📈 Estado del Proyecto

### Completado ✅
- [x] Sistema de autenticación JWT
- [x] CRUD completo de usuarios y entidades
- [x] Sistema de recompensas con monedas
- [x] Paginación en tablas principales
- [x] Validación de formularios
- [x] Toast notifications
- [x] Confirmación de acciones destructivas
- [x] Breadcrumbs de navegación
- [x] Rate limiting en login
- [x] Responsive design

### En Desarrollo 🚧
- [ ] Email verification
- [ ] Password recovery
- [ ] Subida de archivos (evidencias)
- [ ] Sorting por columnas
- [ ] Server-side pagination completo
- [ ] Sistema de notificaciones en tiempo real

### Planificado 📋
- [ ] Dashboard de analytics avanzado
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Sistema de chat entre usuarios
- [ ] Aplicación móvil (React Native)

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🚀 Deployment

### Backend (Node.js)
```bash
cd backend
npm run build
npm start
```

Recomendaciones de hosting:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

### Frontend (React)
```bash
cd frontend
npm run build
```

Los archivos estáticos se generan en `frontend/dist/`

Recomendaciones de hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Base de Datos
Recomendaciones:
- AWS RDS
- Railway (con MySQL)
- PlanetScale
- DigitalOcean Managed Databases

---

## 🤝 Contribuir

Este es un proyecto educativo desarrollado como parte del programa **SENA - Análisis y Desarrollo de Software (ADSO)**. Las contribuciones son bienvenidas.

### Pasos para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto fue desarrollado con fines educativos como parte del programa SENA ADSO.

---

## 👥 Autores

- **Desarrollador Principal** - [obandsalex06](https://github.com/obandsalex06)


---

## 🙏 Agradecimientos

- SENA - Servicio Nacional de Aprendizaje
- Programa ADSO (Análisis y Desarrollo de Software)
- Comunidad de React y Node.js
- Todos los contribuidores del proyecto

---

## 📞 Soporte

¿Necesitas ayuda? Crea un [issue](https://github.com/obandsalex06/PLAYFULL_LEARNING/issues) en el repositorio.

---

## 📚 Documentación Adicional

- 📄 [Documentación Técnica Completa](./DOCUMENTACION_PROYECTO_PLAYFULL_LEARNING.md)
- 📊 [Esquema de Base de Datos](./backend/config/schema.sql)
- 🔐 [Guía de Seguridad JWT](./backend/utils/jwtUtils.js)
