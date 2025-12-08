import sqlite3
import random
from datetime import datetime, timedelta

SQLALCHEMY_DATABASE_URL = "database.db"

conn = sqlite3.connect(SQLALCHEMY_DATABASE_URL)

cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS personne (
    id_personne INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    sexe TEXT,
    mail TEXT,
    telephone TEXT,
    taille_teeshirt TEXT,
    equipe_id INTEGER,
    status TEXT,
    alimentation TEXT,
    id_ecole INTEGER,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id_equipe),
    FOREIGN KEY (id_ecole) REFERENCES ecole(id_ecole)
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS equipe (
    id_equipe INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_equipe TEXT NOT NULL,
    capitaine_id INTEGER,
    id_sport INTEGER,
    niveau TEXT,
    id_ecole INTEGER,
    FOREIGN KEY (capitaine_id) REFERENCES personne(id_personne),
    FOREIGN KEY (id_sport) REFERENCES sport(id_sport),
    FOREIGN KEY (id_ecole) REFERENCES ecole(id_ecole)
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS ecole (
    id_ecole INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    ville TEXT
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS poules (
    id_poules INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sport INTEGER,
    liste_equipe_id TEXT,
    FOREIGN KEY (id_sport) REFERENCES sport(id_sport)
)
''')


cursor.execute('''
CREATE TABLE IF NOT EXISTS match (
    id_match INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sport INTEGER,
    id_terrain INTEGER,
    date_heure DATETIME,
    id_equipe1 INTEGER,
    id_equipe2 INTEGER,
    score_equipe1 INTEGER,
    score_equipe2 INTEGER,
    statut TEXT,
    FOREIGN KEY (id_sport) REFERENCES sport(id_sport),
    FOREIGN KEY (id_terrain) REFERENCES terrain(id_terrain),
    FOREIGN KEY (id_equipe1) REFERENCES equipe(id_equipe),
    FOREIGN KEY (id_equipe2) REFERENCES equipe(id_equipe)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS sport (
    id_sport INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_sport TEXT NOT NULL,
    type TEXT,
    nb_joueurs_equipe INTEGER,
    temps_match INTEGER
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS terrain (
    id_terrain INTEGER PRIMARY KEY AUTOINCREMENT,
    id_poules INTEGER,
    id_terrain_terrain INTEGER,
    id_sport INTEGER,
    date_heure DATETIME,
    materiel TEXT,
    status TEXT,
    FOREIGN KEY (id_poules) REFERENCES poules(id_poules),
    FOREIGN KEY (id_sport) REFERENCES sport(id_sport)
)
''')


ecoles = [
    ("Lycée Jean Moulin", "Paris"),
    ("Collège Victor Hugo", "Lyon"),
    ("École International", "Marseille"),
    ("Lycée Louis Pasteur", "Bordeaux"),
    ("Collège Albert Camus", "Toulouse")
]

for ecole in ecoles:
    cursor.execute("INSERT INTO ecole (nom, ville) VALUES (?, ?)", ecole)

# Insertion des sports
sports = [
    ("Football", "Collectif", 11, 90),
    ("Basketball", "Collectif", 5, 40),
    ("Tennis", "Individuel", 1, 60),
    ("Volleyball", "Collectif", 6, 45),
    ("Rugby", "Collectif", 15, 80)
]


for sport in sports:
    cursor.execute(
        "INSERT INTO sport (nom_sport, type, nb_joueurs_equipe, temps_match) VALUES (?, ?, ?, ?)", sport)

equipes = [
    ("Équipe Rouge", None, 1, "Débutant", 1),
    ("Équipe Bleue", None, 1, "Intermédiaire", 2),
    ("Équipe Verte", None, 2, "Avancé", 3),
    ("Équipe Jaune", None, 3, "Débutant", 4),
    ("Équipe Noire", None, 4, "Intermédiaire", 5),
    ("Équipe Blanche", None, 5, "Avancé", 1)
]

for equipe in equipes:
    cursor.execute(
        "INSERT INTO equipe (nom_equipe, capitaine_id, id_sport, niveau, id_ecole) VALUES (?, ?, ?, ?, ?)", equipe)

# Récupérer les IDs des équipes et des écoles
cursor.execute("SELECT id_equipe FROM equipe")
equipe_ids = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT id_ecole FROM ecole")
ecole_ids = [row[0] for row in cursor.fetchall()]

# Insertion des personnes
prenoms_m = ["Lucas", "Hugo", "Léo", "Gabriel", "Raphaël",
             "Arthur", "Jules", "Adam", "Louis", "Nathan"]
prenoms_f = ["Emma", "Jade", "Louise", "Alice",
             "Chloé", "Lina", "Mia", "Julia", "Anna", "Léa"]
noms = ["Martin", "Bernard", "Dubois", "Thomas", "Robert",
        "Richard", "Petit", "Durand", "Leroy", "Moreau"]

for i in range(30):
    sexe = random.choice(["Homme", "Femme"])
    if sexe == "Homme":
        prenom = random.choice(prenoms_m)
    else:
        prenom = random.choice(prenoms_f)
    nom = random.choice(noms)
    mail = f"{prenom.lower()}.{nom.lower()}@example.com"
    telephone = f"06{random.randint(10000000, 99999999)}"
    taille_teeshirt = random.choice(["S", "M", "L", "XL"])
    equipe_id = random.choice(equipe_ids)
    status = random.choice(["Actif", "Blessé", "Inactif"])
    alimentation = random.choice(
        ["Végétarien", "Végétalien", "Sans restriction", "Allergie aux noix"])
    id_ecole = random.choice(ecole_ids)

    cursor.execute('''
    INSERT INTO personne (nom, prenom, sexe, mail, telephone, taille_teeshirt, equipe_id, status, alimentation, id_ecole)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (nom, prenom, sexe, mail, telephone, taille_teeshirt, equipe_id, status, alimentation, id_ecole))

# Mise à jour des capitaines d'équipe
for i, equipe_id in enumerate(equipe_ids, start=1):
    cursor.execute(
        "UPDATE equipe SET capitaine_id = ? WHERE id_equipe = ?", (i, equipe_id))

conn.commit()

conn.close()
