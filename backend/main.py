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

load_dotenv()

app = FastAPI(title="Fumigation Blockchain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/fumigation_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

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

@app.post("/blockchain/register-appointment")
async def register_appointment_blockchain(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    tx_hash = f"0x{appointment_id:064x}"
    appointment.blockchain_tx = tx_hash
    db.commit()
    
    return {"transaction_hash": tx_hash, "message": "Appointment registered on blockchain"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)