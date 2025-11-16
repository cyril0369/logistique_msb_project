from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from . import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Personne ---


@app.post("/personnes/", response_model=schemas.Personne)
def create_personne(personne: schemas.PersonneCreate,
                    db: Session = Depends(get_db)):
    db_personne = models.Personne(**personne.dict())
    db.add(db_personne)
    db.commit()
    db.refresh(db_personne)
    return db_personne


@app.get("/personnes/", response_model=list[schemas.Personne])
def read_personnes(db: Session = Depends(get_db)):
    return db.query(models.Personne).all()

# --- Equipe ---


@app.post("/equipes/", response_model=schemas.Equipe)
def create_equipe(equipe: schemas.EquipeCreate, db: Session = Depends(get_db)):
    db_equipe = models.Equipe(**equipe.dict())
    db.add(db_equipe)
    db.commit()
    db.refresh(db_equipe)
    return db_equipe


@app.get("/equipes/", response_model=list[schemas.Equipe])
def read_equipes(db: Session = Depends(get_db)):
    return db.query(models.Equipe).all()
