# Aplicación Web de Fumigación con Blockchain

## Descripción
Una aplicación web completa para una empresa de fumigación que integra tecnología blockchain para el registro inmutable de citas y certificados de servicio.

## Características Principales

### 🔐 Autenticación y Roles
- Sistema de autenticación JWT
- Roles de usuario (Cliente/Admin)
- Registro con wallet opcional

### 📅 Calendario Interactivo
- Visualización mensual de disponibilidad
- Código de colores para disponibilidad
- Agendamiento de citas con formulario completo

### 🏢 Servicios Profesionales
- Desratización
- Desinsectación
- Desinfección/Sanitización
- Control de Termitas
- Tratamiento de Murciélagos

### ⛓️ Integración Blockchain
- Registro inmutable de citas en Polygon
- Certificados NFT de fumigación
- Contratos inteligentes en Solidity
- Trazabilidad completa del servicio

## Tecnologías

### Backend
- **FastAPI** - Framework web moderno para Python
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Web3.py** - Integración blockchain

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utilitario

### Blockchain
- **Solidity** - Contratos inteligentes
- **Hardhat** - Entorno de desarrollo
- **Polygon** - Red blockchain (MATIC)
- **OpenZeppelin** - Contratos seguros

## Instalación y Uso

### Prerequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Python 3.9+ (para desarrollo local)

### Configuración con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd app-blockchain
```

2. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# Frontend
cp frontend/.env.example frontend/.env
# Editar frontend/.env con la URL del backend

# Blockchain
cp service-blockchain/.env.example service-blockchain/.env
# Editar service-blockchain/.env con tus claves
```

3. **Ejecutar con Docker Compose**
```bash
# Iniciar servicios principales
docker-compose up -d

# Incluir servicio blockchain
docker-compose --profile blockchain up -d
```

4. **Crear el primer administrador**
```bash
# Usar la API para crear el primer admin
curl -X POST http://localhost:8000/auth/create-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fumigacion.com",
    "password": "admin123",
    "full_name": "Administrador Principal",
    "phone": "+1234567890"
  }'
```

5. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Desarrollo Local

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Blockchain
```bash
cd service-blockchain
npm install
npm run compile
npm run deploy
```

## Uso de la Aplicación

### Para Clientes
1. Registrarse en la plataforma
2. Explorar servicios disponibles
3. Usar el calendario para agendar citas
4. Seguir el estado de las citas en el dashboard
5. Recibir certificados NFT al completar servicios

### Para Administradores
1. **Gestionar citas**: Ver todas las citas con información del cliente
2. **Aprobar/Rechazar**: Botones para aprobar o rechazar citas pendientes
3. **Completar servicios**: Marcar servicios como completados
4. **Registrar en blockchain**: Crear registros inmutables de citas
5. **Crear otros admins**: Usar endpoint `/auth/create-admin`

### Endpoints Administrativos

- `POST /auth/create-first-admin`: Crear primer admin (sin autenticación)
- `POST /auth/create-admin`: Crear admin adicional (requiere auth admin)
- `PUT /appointments/{id}/status`: Actualizar estado de cita
- `GET /appointments`: Ver todas las citas (admin) o solo propias (cliente)
- `POST /blockchain/register-appointment`: Registrar cita en blockchain
- `GET /blockchain/status`: Verificar estado de conexión blockchain

## Estructura del Proyecto

```
app-blockchain/
├── backend/              # API FastAPI
│   ├── main.py          # Aplicación principal
│   ├── requirements.txt # Dependencias Python
│   └── Dockerfile       # Configuración Docker
├── frontend/            # Aplicación React
│   ├── src/            # Código fuente
│   ├── package.json    # Dependencias Node.js
│   └── Dockerfile      # Configuración Docker
├── service-blockchain/  # Contratos inteligentes
│   ├── contracts/      # Contratos Solidity
│   ├── scripts/        # Scripts de despliegue
│   └── hardhat.config.js # Configuración Hardhat
├── utils/              # Recursos compartidos
│   ├── logo.png        # Logo de la empresa
│   └── portada-background.jpg # Imagen de fondo
├── docker-compose.yml  # Orquestación de servicios
└── README.md          # Este archivo
```

## Integración Blockchain

### ¿Qué hace el Blockchain?

El blockchain **SÍ** se utiliza para:

1. **Registro Inmutable de Citas**: Cada cita aprobada se registra permanentemente
2. **Certificados NFT**: Al completar un servicio, se genera automáticamente un certificado digital verificable
3. **Trazabilidad**: Historial completo e inalterable de todos los servicios
4. **Transparencia**: Todas las transacciones son públicamente verificables

### ¿Qué NO hace el Blockchain?

El blockchain **NO** se utiliza para:

1. **Almacenamiento de Datos Personales**: Emails, teléfonos, etc. se guardan en base de datos tradicional
2. **Proceso de Autenticación**: Login/registro usan JWT tradicional
3. **Gestión de Calendario**: Disponibilidad se maneja en PostgreSQL
4. **Datos Sensibles**: Por privacidad, solo se registran IDs y metadatos

### Arquitectura Híbrida

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   FastAPI       │    │   Polygon       │
│                 │    │                 │    │                 │
│ • Usuarios      │◄───┤ • Autenticación │◄───┤ • Citas         │
│ • Citas         │    │ • API REST      │    │ • Certificados  │
│ • Sesiones      │    │ • Web3.py       │    │ • Inmutabilidad │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flujo de Trabajo

1. **Cliente registra cita** → Base de datos (PostgreSQL)
2. **Admin aprueba cita** → Base de datos actualizada
3. **Sistema registra en blockchain** → Transacción en Polygon
4. **Servicio completado** → Certificado NFT generado automáticamente
5. **Cliente recibe certificado** → Token ERC-721 en su wallet

### Configuración Blockchain

Para activar blockchain real:

```env
# Backend/.env
BLOCKCHAIN_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address
```

**Nota**: Sin configuración blockchain, el sistema funciona en modo simulado con hashes falsos.

### Contrato Inteligente

- **Archivo**: `service-blockchain/contracts/FumigationService.sol`
- **Red**: Polygon Mainnet
- **Estándar**: ERC-721 (certificados NFT)
- **Funciones**:
  - `createAppointment()`: Registra cita en blockchain
  - `updateAppointmentStatus()`: Actualiza estado
  - `_issueCertificate()`: Genera NFT automáticamente

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o consultas:
- Email: soporte@fumigacion-blockchain.com
- Documentación: http://localhost:8000/docs
- Issues: GitHub Issues del proyecto
