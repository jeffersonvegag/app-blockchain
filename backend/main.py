from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
from dotenv import load_dotenv
from web3 import Web3
import json

load_dotenv()

app = FastAPI(title="Fumigation Blockchain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración directa para Render
DATABASE_URL = "postgresql://blockchain_flcg_user:iLx44fReiKMHR44Ho3bBd3c8EiR9dQWy@dpg-d1rckb7fte5s73d0bnhg-a.oregon-postgres.render.com/blockchain_flcg"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

JWT_SECRET = "blockchain-fumigation-jwt-secret-2024"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Blockchain configuration
BLOCKCHAIN_RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY")
BLOCKCHAIN_PRIVATE_KEY = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")

# Initialize Web3 (only if blockchain is configured)
web3 = None
contract = None
if BLOCKCHAIN_PRIVATE_KEY and CONTRACT_ADDRESS and "YOUR_INFURA_KEY" not in BLOCKCHAIN_RPC_URL:
    try:
        web3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_RPC_URL))
        # Contract ABI - simplified for demo
        contract_abi = json.loads('''[
            {
                "inputs": [
                    {"name": "_cliente", "type": "address"},
                    {"name": "_serviceType", "type": "string"},
                    {"name": "_appointmentDate", "type": "uint256"},
                    {"name": "_serviceAddress", "type": "string"},
                    {"name": "_comments", "type": "string"}
                ],
                "name": "createAppointment",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "_appointmentId", "type": "uint256"},
                    {"name": "_status", "type": "uint8"}
                ],
                "name": "updateAppointmentStatus",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]''')
        contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)
    except Exception as e:
        print(f"Blockchain connection failed: {e}")
        web3 = None
        contract = None

security = HTTPBearer()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String)
    role = Column(String, default="client")
    wallet_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    service_type = Column(String)
    date = Column(DateTime)
    address = Column(Text)
    comments = Column(Text)
    status = Column(String, default="pending")
    blockchain_tx = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Mover la creación de tablas dentro de una función de startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    wallet_address: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class AppointmentCreate(BaseModel):
    service_type: str
    date: datetime
    address: str
    comments: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    service_type: str
    date: datetime
    address: str
    comments: Optional[str]
    status: str
    blockchain_tx: Optional[str]
    created_at: datetime

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

def get_current_user(email: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    db_user = User(
        email=user.email,
        hashed_password=hashed_password.decode('utf-8'),
        full_name=user.full_name,
        phone=user.phone,
        wallet_address=user.wallet_address
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "role": db_user.role}}

@app.post("/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "role": db_user.role}}

@app.get("/appointments")
async def get_appointments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        appointments = db.query(Appointment).all()
        # Incluir datos del usuario para admin
        appointments_with_user = []
        for appointment in appointments:
            user = db.query(User).filter(User.id == appointment.user_id).first()
            appointment_dict = {
                "id": appointment.id,
                "user_id": appointment.user_id,
                "service_type": appointment.service_type,
                "date": appointment.date,
                "address": appointment.address,
                "comments": appointment.comments,
                "status": appointment.status,
                "blockchain_tx": appointment.blockchain_tx,
                "created_at": appointment.created_at,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone": user.phone
                } if user else None
            }
            appointments_with_user.append(appointment_dict)
        return appointments_with_user
    else:
        appointments = db.query(Appointment).filter(Appointment.user_id == current_user.id).all()
        return appointments

@app.post("/appointments")
async def create_appointment(appointment: AppointmentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_appointment = db.query(Appointment).filter(
        Appointment.date == appointment.date,
        Appointment.status.in_(["pending", "approved"])
    ).first()
    
    if existing_appointment:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    
    db_appointment = Appointment(
        user_id=current_user.id,
        service_type=appointment.service_type,
        date=appointment.date,
        address=appointment.address,
        comments=appointment.comments
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    return db_appointment

@app.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: int, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = status
    db.commit()
    
    return appointment

@app.get("/calendar/available")
async def get_available_dates(month: int, year: int, db: Session = Depends(get_db)):
    from calendar import monthrange
    
    _, days_in_month = monthrange(year, month)
    available_dates = []
    
    for day in range(1, days_in_month + 1):
        date = datetime(year, month, day)
        if date >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
            existing_appointment = db.query(Appointment).filter(
                Appointment.date >= date,
                Appointment.date < date + timedelta(days=1),
                Appointment.status.in_(["pending", "approved"])
            ).first()
            
            available_dates.append({
                "date": date.isoformat(),
                "available": not existing_appointment
            })
    
    return available_dates

@app.get("/services")
async def get_services():
    services = [
        {
            "id": 1,
            "name": "Desratización",
            "description": "Control de roedores: Cordones sanitarios, asesoría, instalación y mantenimiento de estaciones de cebado y de captura."
        },
        {
            "id": 2,
            "name": "Desinsectación",
            "description": "Control de insectos voladores y rastreros: Fumigaciones mediante aspersión, nebulización y termo nebulizaciones."
        },
        {
            "id": 3,
            "name": "Desinfección/Sanitización",
            "description": "Eliminación de elementos patógenos como virus, bacterias y hongos mediante desinfectantes especializados."
        },
        {
            "id": 4,
            "name": "Control de Termitas",
            "description": "Tratamiento especializado para termitas subterráneas mediante perforaciones e inyección directa."
        },
        {
            "id": 5,
            "name": "Tratamiento de Murciélagos",
            "description": "Proceso de sellado, limpieza, desinfección y reubicación de fauna silvestre."
        }
    ]
    return services

@app.post("/auth/create-first-admin")
async def create_first_admin(user: UserCreate, db: Session = Depends(get_db)):
    # Solo permitir crear admin si no hay admins en el sistema
    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        raise HTTPException(status_code=403, detail="Admin already exists. Use /auth/create-admin instead.")
    
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    db_user = User(
        email=user.email,
        hashed_password=hashed_password.decode('utf-8'),
        full_name=user.full_name,
        phone=user.phone,
        wallet_address=user.wallet_address,
        role="admin"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "role": db_user.role}}

@app.post("/auth/create-admin")
async def create_admin(user: UserCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create other admins")
    
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    
    db_user = User(
        email=user.email,
        hashed_password=hashed_password.decode('utf-8'),
        full_name=user.full_name,
        phone=user.phone,
        wallet_address=user.wallet_address,
        role="admin"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "Admin created successfully", "user": {"id": db_user.id, "email": db_user.email, "full_name": db_user.full_name, "role": db_user.role}}

@app.post("/blockchain/register-appointment")
async def register_appointment_blockchain(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Si blockchain está configurado, usar Web3
    if web3 and contract and web3.is_connected():
        try:
            # Obtener datos del usuario
            user = db.query(User).filter(User.id == appointment.user_id).first()
            client_address = user.wallet_address if user and user.wallet_address else "0x0000000000000000000000000000000000000000"
            
            # Preparar transacción
            account = web3.eth.account.from_key(BLOCKCHAIN_PRIVATE_KEY)
            nonce = web3.eth.get_transaction_count(account.address)
            
            # Crear transacción
            transaction = contract.functions.createAppointment(
                client_address,
                appointment.service_type,
                int(appointment.date.timestamp()),
                appointment.address,
                appointment.comments or ""
            ).build_transaction({
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': web3.to_wei('20', 'gwei'),
                'from': account.address
            })
            
            # Firmar y enviar transacción
            signed_txn = web3.eth.account.sign_transaction(transaction, BLOCKCHAIN_PRIVATE_KEY)
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Esperar confirmación
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            appointment.blockchain_tx = receipt.transactionHash.hex()
            db.commit()
            
            return {"transaction_hash": receipt.transactionHash.hex(), "message": "Appointment registered on blockchain", "blockchain_enabled": True}
            
        except Exception as e:
            print(f"Blockchain transaction failed: {e}")
            # Fallback a hash simulado
            tx_hash = f"0x{appointment_id:064x}"
            appointment.blockchain_tx = tx_hash
            db.commit()
            return {"transaction_hash": tx_hash, "message": "Appointment registered (simulated)", "blockchain_enabled": False, "error": str(e)}
    
    # Fallback: usar hash simulado
    tx_hash = f"0x{appointment_id:064x}"
    appointment.blockchain_tx = tx_hash
    db.commit()
    
    return {"transaction_hash": tx_hash, "message": "Appointment registered (simulated)", "blockchain_enabled": False}

@app.get("/blockchain/status")
async def get_blockchain_status():
    if web3 and contract:
        try:
            is_connected = web3.is_connected()
            if is_connected:
                latest_block = web3.eth.block_number
                return {
                    "connected": True,
                    "network": "Polygon",
                    "latest_block": latest_block,
                    "contract_address": CONTRACT_ADDRESS,
                    "rpc_url": BLOCKCHAIN_RPC_URL
                }
            else:
                return {"connected": False, "error": "Web3 not connected"}
        except Exception as e:
            return {"connected": False, "error": str(e)}
    else:
        return {"connected": False, "error": "Blockchain not configured"}

@app.get("/")
async def root():
    return {"message": "Fumigation Blockchain API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
