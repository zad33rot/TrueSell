from fastapi import APIRouter, status
from typing import Optional
from database import get_db
from schemas import AdCreate, BanRequest

router = APIRouter(prefix="/api", tags=["Объявления"])

@router.get("/ads")
def get_ads(only_private: bool = False, user_id: Optional[int] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = """
        SELECT a.id, a.title, a.description, a.price, a.is_private, a.can_barter, a.image_url, a.user_id, a.phone, a.is_sold,
               u.name as seller_name, u.email as seller_email 
        FROM ads a JOIN users u ON a.user_id = u.id 
        WHERE a.is_banned = FALSE
    """
    params = []
    if only_private:
        query += " AND a.is_private = TRUE"
    if user_id is not None:
        query += " AND a.user_id = %s"
        params.append(user_id)
        
    query += " ORDER BY a.id DESC"
    cursor.execute(query, tuple(params))
    ads = cursor.fetchall()
    cursor.close()
    conn.close()
    return ads

@router.post("/ads", status_code=status.HTTP_201_CREATED)
def create_ad(ad: AdCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO ads (title, description, price, is_private, can_barter, image_url, phone, user_id) 
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;""",
        (ad.title, ad.description, ad.price, ad.is_private, ad.can_barter, ad.image_url, ad.phone, ad.user_id)
    )
    new_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": new_id}

@router.put("/ads/{ad_id}")
def update_ad(ad_id: int, ad: AdCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE ads SET title=%s, description=%s, price=%s, is_private=%s, can_barter=%s, image_url=%s, phone=%s 
           WHERE id=%s;""",
        (ad.title, ad.description, ad.price, ad.is_private, ad.can_barter, ad.image_url, ad.phone, ad_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Обновлено"}

@router.delete("/ads/{ad_id}")
def delete_ad(ad_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ads WHERE id = %s;", (ad_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Удалено"}

@router.put("/ads/{ad_id}/sold")
def mark_ad_sold(ad_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE ads SET is_sold = TRUE WHERE id = %s;", (ad_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Продано"}

@router.get("/admin/ads")
def admin_get_all_ads():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT a.id, a.title, a.is_banned, a.violation_reason, a.is_sold, a.user_id, a.description, a.price, a.is_private, a.can_barter, a.image_url, a.phone, u.name as seller_name FROM ads a JOIN users u ON a.user_id = u.id ORDER BY a.id DESC")
    ads = cursor.fetchall()
    cursor.close()
    conn.close()
    return ads

@router.put("/ads/{ad_id}/ban")
def ban_ad(ad_id: int, req: BanRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, title FROM ads WHERE id = %s", (ad_id,))
    ad_info = cursor.fetchone()
    cursor.execute("UPDATE ads SET is_banned = TRUE, violation_reason = %s WHERE id = %s", (req.reason, ad_id))
    if ad_info:
        msg = f"Ваше объявление «{ad_info['title']}» было заблокировано модератором. Причина: {req.reason}"
        cursor.execute("INSERT INTO notifications (user_id, message) VALUES (%s, %s)", (ad_info['user_id'], msg))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Banned"}