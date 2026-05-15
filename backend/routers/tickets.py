from fastapi import APIRouter, status
from database import get_db
from schemas import TicketCreate, TicketResponse

router = APIRouter(prefix="/api", tags=["Тикеты"])

@router.get("/tickets/user/{user_id}")
def get_user_tickets(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, subject, status, admin_response FROM tickets WHERE user_id = %s ORDER BY id DESC", (user_id,))
    tickets = cursor.fetchall()
    cursor.close()
    conn.close()
    return tickets

@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tickets (user_id, subject) VALUES (%s, %s) RETURNING id;", (ticket.user_id, ticket.subject))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Created"}


@router.get("/tickets")
def get_all_tickets():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT t.id, t.subject, t.status, t.admin_response, u.name as user_name FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.id DESC")
    tickets = cursor.fetchall()
    cursor.close()
    conn.close()
    return tickets

@router.put("/tickets/{ticket_id}/respond")
def respond_ticket(ticket_id: int, req: TicketResponse):
    conn = get_db()
    cursor = conn.cursor()
    
    # ищем кто создал тикет и отвечаем
    cursor.execute("SELECT user_id, subject FROM tickets WHERE id = %s", (ticket_id,))
    ticket_info = cursor.fetchone()
    
    # сохр ответ и закрываем тикет
    cursor.execute("UPDATE tickets SET admin_response = %s, status = 'closed' WHERE id = %s", (req.response, ticket_id))
    
    # уведомлению юезру
    if ticket_info:
        msg = f"Получен ответ от службы поддержки на ваш запрос: «{ticket_info['subject']}»."
        cursor.execute("INSERT INTO notifications (user_id, message) VALUES (%s, %s)", (ticket_info['user_id'], msg))
        
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Responded"}