# backend/routers/auth.py
from fastapi import APIRouter, HTTPException, status
import psycopg2
from database import get_db
from schemas import UserRegister, UserLogin

# роутер
router = APIRouter(prefix="/api", tags=["Авторизация"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, name, email;",
            (user.email, user.password, user.name)
        )
        new_user = cursor.fetchone()
        conn.commit()
        return new_user
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email уже занят")
    finally:
        cursor.close()
        conn.close()

@router.post("/login")
def login_user(user: UserLogin):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s", (user.email, user.password))
    db_user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not db_user:
        raise HTTPException(status_code=400, detail="Неверный логин или пароль")
    return db_user