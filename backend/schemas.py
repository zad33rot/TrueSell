from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class AdCreate(BaseModel):
    title: str
    description: str
    price: int
    is_private: bool
    can_barter: bool
    image_url: str
    phone: str
    user_id: int

class BarterOfferCreate(BaseModel):
    target_ad_id: int
    offered_item_desc: str

class TicketCreate(BaseModel):
    user_id: int
    subject: str

class BanRequest(BaseModel):
    reason: str

class TicketResponse(BaseModel):
    response: str