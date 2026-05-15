import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    "dbname": "truesell_bd",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}

def get_db():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)