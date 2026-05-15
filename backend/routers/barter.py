from fastapi import APIRouter, status
from database import get_db
from schemas import BarterOfferCreate

router = APIRouter(prefix="/api", tags=["Бартер"])

@router.post("/barter", status_code=status.HTTP_201_CREATED)
def create_barter_offer(offer: BarterOfferCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO barter_offers (target_ad_id, offer_description) VALUES (%s, %s) RETURNING id;",
        (offer.target_ad_id, offer.offered_item_desc) 
    )
    offer_id = cursor.fetchone()['id']
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": offer_id}

@router.get("/barter/{user_id}")
def get_barter_offers(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.id, b.status, b.offer_description, t.title as target_title
        FROM barter_offers b
        JOIN ads t ON b.target_ad_id = t.id
        WHERE t.user_id = %s ORDER BY b.id DESC
    """, (user_id,))
    offers = cursor.fetchall()
    cursor.close()
    conn.close()
    return offers