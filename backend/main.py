from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime


app = FastAPI(title="MSB API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {"message": "MSB API - Bienvenue !"}


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


@app.post("/personnes")
def create_personne(personne: PersonneCreate, conn=Depends(get_db)):
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO personne (prenom, nom, email, mot_de_passe, telephone,
                                 genre, statut, taille_tshirt,
                                 regime_alimentaire, remarques, id_ecole)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (personne.prenom, personne.nom, personne.email,
             personne.mot_de_passe, personne.telephone, personne.genre,
             personne.statut, personne.taille_tshirt,
             personne.regime_alimentaire, personne.remarques,
             personne.id_ecole)
        )
        nouvelle_personne = cursor.fetchone()
        conn.commit()
        cursor.close()
        return nouvelle_personne
    except psycopg2.IntegrityError as e:
        conn.rollback()
        cursor.close()
        if "email" in str(e):
            raise HTTPException(
                status_code=400, detail="Cet email existe déjà")
        raise HTTPException(status_code=400, detail="Erreur de création")
