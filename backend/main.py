from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="TrueSell API")

# Конфиг БД (поменяй пароль на свой из pgAdmin)
DB_CONFIG = {
    "dbname": "truesell_db",
    "user": "postgres",
    "password": "yourpassword", 
    "host": "localhost",
    "port": "5432"
}

def get_db():
    """Функция для подключения к БД (возвращает коннект)"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

# --- Pydantic Схемы (Валидация данных) ---

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class AdCreate(BaseModel):
    title: str
    description: str
    price: int
    is_private: bool
    image_url: str
    user_id: int # В будущем будем брать из токена авторизации, пока передаем явно

# --- Эндпоинты (Ручки API) ---

@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    """Регистрация нового пользователя"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # В реальном проекте тут нужно хэшировать пароль через bcrypt!
        # Пока пишем как есть для прототипа
        cursor.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id;",
            (user.email, user.password, user.name)
        )
        new_user_id = cursor.fetchone()['id']
        conn.commit()
        return {"message": "Пользователь успешно создан", "user_id": new_user_id}
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    finally:
        cursor.close()
        conn.close()

@app.get("/api/ads")
def get_ads(only_private: bool = False):
    """Получить все объявления. С поддержкой нашей фичи 'Только частники'"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Делаем JOIN, чтобы сразу отдавать имя продавца вместе с объявлением
    query = """
        SELECT a.id, a.title, a.description, a.price, a.is_private, a.image_url, 
               u.name as seller_name, u.email as seller_email 
        FROM ads a
        JOIN users u ON a.user_id = u.id
    """
    
    if only_private:
        query += " WHERE a.is_private = TRUE"
        
    cursor.execute(query)
    ads = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return ads

@app.post("/api/ads", status_code=status.HTTP_201_CREATED)
def create_ad(ad: AdCreate):
    """Создать новое объявление"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        INSERT INTO ads (title, description, price, is_private, image_url, user_id) 
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
        """,
        (ad.title, ad.description, ad.price, ad.is_private, ad.image_url, ad.user_id)
    )
    new_ad_id = cursor.fetchone()['id']
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"message": "Объявление опубликовано", "ad_id": new_ad_id}