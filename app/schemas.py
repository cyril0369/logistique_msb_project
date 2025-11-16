from pydantic import BaseModel
from typing import List, Optional


class PersonneBase(BaseModel):
    nom: str
    prenom: str
    sexe: Optional[str] = None
    mail: Optional[str] = None
    telephone: Optional[str] = None
    taille_teeshirt: Optional[str] = None
    equipe_id: Optional[int] = None
    status: Optional[str] = None
    alimentation: Optional[str] = None


class PersonneCreate(PersonneBase):
    pass


class Personne(PersonneBase):
    id: int

    class Config:
        orm_mode = True


class EquipeBase(BaseModel):
    nom_equipe: str
    capitaine_id: Optional[int] = None
    sport: Optional[str] = None
    niveau: Optional[str] = None


class EquipeCreate(EquipeBase):
    pass


class Equipe(EquipeBase):
    id: int
    membres: List[Personne] = []

    class Config:
        orm_mode = True
