from fastapi import APIRouter
from database import get_db

router = APIRouter(prefix="/api", tags=["Уведомления"])

@router.get("/notifications/{user_id}")
def get_notifications(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY id DESC", (user_id,))
    notifications = cursor.fetchall()
    cursor.close()
    conn.close()
    return notifications

@router.put("/notifications/{notif_id}/read")
def read_notification(notif_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notif_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Прочитано"}