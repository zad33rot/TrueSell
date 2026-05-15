import psycopg2

DB_CONFIG = {
    "dbname": "truesell_bd",
    "user": "postgres",
    "password": "postgres", # <-- ВПИШИ ПАРОЛЬ
    "host": "localhost",
    "port": "5432"
}

try:
    print("Пробую подключиться...")
    conn = psycopg2.connect(**DB_CONFIG)
    print("✅ ПОДКЛЮЧЕНИЕ ПРОШЛО УСПЕШНО! База работает!")
    conn.close()
except Exception as e:
    print("❌ ОШИБКА ПОДКЛЮЧЕНИЯ:")
    # repr() поможет вывести ошибку без падения из-за кодировки
    print(repr(e))