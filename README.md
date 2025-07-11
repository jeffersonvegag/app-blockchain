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

4. **Acceder a la aplicación**
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
1. Gestionar disponibilidad del calendario
2. Aprobar/rechazar citas de clientes
3. Actualizar estados de servicios
4. Registrar servicios en blockchain
5. Emitir certificados NFT

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

## Blockchain Integration

El proyecto utiliza contratos inteligentes en Polygon para:

- **Registro de Citas**: Cada cita se registra de forma inmutable
- **Certificados NFT**: Comprobantes digitales verificables
- **Trazabilidad**: Historial completo de servicios
- **Transparencia**: Todas las transacciones son verificables

### Contrato Principal
- **FumigationService.sol**: Gestión de citas y certificados
- **Red**: Polygon (MATIC)
- **Estándar**: ERC-721 para certificados NFT

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
