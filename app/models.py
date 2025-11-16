from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Equipe(Base):
    __tablename__ = "equipe"
    id = Column(Integer, primary_key=True, index=True)
    nom_equipe = Column(String, unique=True)
    capitaine_id = Column(Integer, ForeignKey("personne.id"), nullable=True)
    sport = Column(String)
    niveau = Column(String)

    membres = relationship("Personne", back_populates="equipe")
    capitaine = relationship("Personne", foreign_keys=[
                             capitaine_id], post_update=True)


class Personne(Base):
    __tablename__ = "personne"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    sexe = Column(String)
    mail = Column(String, unique=True)
    telephone = Column(String)
    taille_teeshirt = Column(String)
    equipe_id = Column(Integer, ForeignKey("equipe.id"), nullable=True)
    status = Column(String)
    alimentation = Column(String)

    equipe = relationship("Equipe", back_populates="membres")
