from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta
import jwt
import bcrypt


app = FastAPI(title="MSB API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7


def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "msb-postgres"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "msb_db"),
        user=os.getenv("DB_USER", "msb_user"),
        password=os.getenv("DB_PASSWORD", "msb_password"),
        cursor_factory=RealDictCursor
    )
    try:
        yield conn
    finally:
        conn.close()


def create_jwt_token(user_data: dict) -> str:
    """Créer un token JWT"""
    payload = {
        "id": user_data["id_personne"],
        "email": user_data["email"],
        "statut": user_data["statut"],
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


class PersonneCreate(BaseModel):
    prenom: str
    nom: str
    email: EmailStr
    mot_de_passe: str
    telephone: Optional[str] = None
    genre: Optional[str] = None
    statut: str
    taille_tshirt: Optional[str] = None
    regime_alimentaire: Optional[str] = None
    remarques: Optional[str] = None
    id_ecole: Optional[int] = None


class PersonneResponse(BaseModel):
    id_personne: int
    prenom: str
    nom: str
    email: str
    telephone: Optional[str]
    genre: Optional[str]
    statut: str
    taille_tshirt: Optional[str]
    regime_alimentaire: Optional[str]
    remarques: Optional[str]
    id_ecole: Optional[int]
    created_at: datetime


class StaffeurCreate(BaseModel):
    id_personne: int
    type_staff: Optional[str] = None
    staff_autres_assos: bool = False
    participation_pompims: bool = False
    preference_heures_max: Optional[int] = None
    contrainte_heures_consecutives_max: Optional[int] = None
    remarques_staff: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str


@app.get("/")
def root():
    return {"message": "MSB API - Bienvenue !"}

####################
# GESTION DE LOGIN #
####################


@app.post("/auth/signup")
def signup(request: PersonneCreate, conn=Depends(get_db)):
    """Inscription d'un nouvel utilisateur"""
    cursor = conn.cursor()

    try:
        # Vérifier si l'email existe déjà
        cursor.execute(
            "SELECT email FROM personne WHERE email = %s", (request.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, detail="Cet email est déjà utilisé")

        # Hasher le mot de passe
        hashed_password = bcrypt.hashpw(request.mot_de_passe.encode(
            'utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Créer la personne
        cursor.execute(
            """
            INSERT INTO personne (prenom, nom, email, mot_de_passe, telephone,
            genre, statut, taille_tshirt, regime_alimentaire, remarques,
            id_ecole) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id_personne, prenom, nom, email, statut, telephone, genre
            """,
            (request.prenom, request.nom, request.email, hashed_password,
             request.telephone, request.genre, request.statut,
             request.taille_tshirt, request.regime_alimentaire,
             request.remarques, request.id_ecole)
        )
        user = cursor.fetchone()
        conn.commit()
        cursor.close()

        # Générer le JWT
        token = create_jwt_token(user)

        return {
            "message": "Inscription réussie",
            "token": token,
            "user": {
                "id": user["id_personne"],
                "prenom": user["prenom"],
                "nom": user["nom"],
                "email": user["email"],
                "statut": user["statut"]
            }
        }
    except psycopg2.IntegrityError:
        conn.rollback()
        cursor.close()
        raise HTTPException(
            status_code=400, detail="Erreur lors de l'inscription")


@app.post("/auth/login")
def login(request: LoginRequest, conn=Depends(get_db)):
    """Connexion d'un utilisateur"""
    cursor = conn.cursor()

    # Récupérer l'utilisateur par email
    cursor.execute("SELECT * FROM personne WHERE email = %s", (request.email,))
    user = cursor.fetchone()
    cursor.close()

    # Vérifier si l'utilisateur existe
    if not user:
        raise HTTPException(
            status_code=401, detail="Email ou mot de passe incorrect")

    # Vérifier le mot de passe
    if not bcrypt.checkpw(request.mot_de_passe.encode('utf-8'),
                          user["mot_de_passe"].encode('utf-8')):
        raise HTTPException(
            status_code=401, detail="Email ou mot de passe incorrect")

    # Générer le JWT
    token = create_jwt_token(user)

    return {
        "message": "Connexion réussie",
        "token": token,
        "user": {
            "id": user["id_personne"],
            "prenom": user["prenom"],
            "nom": user["nom"],
            "email": user["email"],
            "statut": user["statut"]
        }
    }


@app.get("/personnes")
def get_personnes(conn=Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM personne")
    personnes = cursor.fetchall()
    cursor.close()
    return personnes


@app.get("/personnes/{id_personne}")
def get_personne(id_personne: int, conn=Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM personne WHERE id_personne = %s", (id_personne,))
    personne = cursor.fetchone()
    cursor.close()

    if not personne:
        raise HTTPException(status_code=404, detail="Personne non trouvée")
    return personne
