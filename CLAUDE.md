# Aplicación Web de Fumigación con Blockchain

## Descripción del Proyecto
Esta es una aplicación web completa para una empresa de fumigación que integra tecnología blockchain para el registro inmutable de citas y certificados de servicio.

## Estructura del Proyecto
```
app-blockchain/
├── backend/          # FastAPI backend con Python
├── frontend/         # React + Vite + TypeScript frontend
├── service-blockchain/ # Implementación blockchain
├── utils/           # Recursos compartidos (imágenes, etc.)
└── README.md
```

## Tecnologías Principales
- **Backend**: FastAPI, Python 3.9+, PostgreSQL/MongoDB, JWT Auth
- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS
- **Blockchain**: Polygon (MATIC), Solidity, Web3.py

## Funcionalidades Clave

### Sistema de Roles
- **Cliente**: Registro, agendamiento de citas, seguimiento
- **Admin**: Gestión de calendario, aprobación de citas, dashboard

### Calendario Interactivo
- Visualización mensual con disponibilidad
- Código de colores:
  - Celeste: Días disponibles
  - Rojo: Días ocupados/no disponibles
  - Verde: Citas confirmadas (admin)

### Integración Blockchain
- Registro inmutable de citas en contratos inteligentes
- Certificados digitales NFT de fumigación
- Trazabilidad completa del servicio
- Verificación de identidad

### Servicios Ofrecidos
1. **Desratización** - Control de roedores
2. **Desinsectación** - Control de insectos voladores y rastreros
3. **Desinfección/Sanitización** - Eliminación de patógenos
4. **Control de Termitas** - Tratamiento especializado
5. **Tratamiento de Murciélagos** - Reubicación y control

## Comandos de Desarrollo
- Backend: `cd backend && uvicorn main:app --reload`
- Frontend: `cd frontend && npm run dev`
- Blockchain: Scripts en service-blockchain/

## Estados de Cita
- Pendiente: Esperando aprobación admin
- Aprobada: Confirmada por admin
- En Progreso: Servicio siendo ejecutado
- Completada: Servicio terminado con certificado NFT

## Archivos de Recursos
- `utils/logo.png`: Logo de la empresa
- `utils/portada-background.jpg`: Imagen de fondo para landing page