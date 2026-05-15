import React, { useState, useEffect } from 'react';
import type { ViewState } from '../types';

const API_URL = 'http://localhost:8000/api';

interface ProfileProps {
  currentUser: any;
  setCurrentView: (view: ViewState) => void;
  setEditingAd: (ad: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, setCurrentView, setEditingAd }) => {
  // состояние страницы профиля
  const [activeTab, setActiveTab] = useState<string>('myAds');
  
  // данные пользователя
  const [myAds, setMyAds] = useState<any[]>([]);
  const [barterOffers, setBarterOffers] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]); 
  
  // данные админа
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [allAdsForAdmin, setAllAdsForAdmin] = useState<any[]>([]);

  // загрузка всех данных для профиля
  const fetchProfileData = () => {
    if (!currentUser) return;
    
    fetch(`${API_URL}/ads?user_id=${currentUser.id}`).then(res => res.json()).then(setMyAds);
    fetch(`${API_URL}/barter/${currentUser.id}`).then(res => res.json()).then(setBarterOffers);
    fetch(`${API_URL}/tickets/user/${currentUser.id}`).then(res => res.json()).then(setMyTickets);
    fetch(`${API_URL}/notifications/${currentUser.id}`).then(res => res.json()).then(setNotifications); 
    
    if (currentUser.email === 'admin@mail.ru') {
      fetch(`${API_URL}/tickets`).then(res => res.json()).then(setAdminTickets);
      fetch(`${API_URL}/admin/ads`).then(res => res.json()).then(setAllAdsForAdmin);
    }
  };

  // запускаем загрузки
  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  // работа с объявлением
  const handleDeleteAd = async (adId: number) => {
    if (!window.confirm("Вы точно хотите удалить это объявление навсегда?")) return;
    await fetch(`${API_URL}/ads/${adId}`, { method: 'DELETE' });
    fetchProfileData();
  };

  const handleMarkSold = async (adId: number) => {
    await fetch(`${API_URL}/ads/${adId}/sold`, { method: 'PUT' });
    fetchProfileData();
  };

  // действия админа
  const handleBan = async (adId: number) => {
    const reason = prompt('Укажите причину блокировки:');
    if (!reason) return;
    await fetch(`${API_URL}/ads/${adId}/ban`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
    fetchProfileData();
  };

  const sendResponse = async (ticketId: number) => {
    const input = document.getElementById(`ans-${ticketId}`) as HTMLInputElement;
    if (!input || !input.value) return;
    await fetch(`${API_URL}/tickets/${ticketId}/respond`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response: input.value }) });
    fetchProfileData();
  };

  // действия юзера
  const createTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = (e.currentTarget.elements.namedItem('subject') as HTMLInputElement).value;
    await fetch(`${API_URL}/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: currentUser.id, subject }) });
    e.currentTarget.reset();
    fetchProfileData();
  };

  const handleReadNotification = async (notifId: number) => {
    await fetch(`${API_URL}/notifications/${notifId}/read`, { method: 'PUT' });
    fetchProfileData();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <section className="profile-page fade-in">
      <div className="profile-dashboard">
        <h2>Личный кабинет: {currentUser.name}</h2>
        <div className="tabs">
          <button className={`tab ${activeTab === 'myAds' ? 'active' : ''}`} onClick={() => setActiveTab('myAds')}>Мои объявления</button>
          <button className={`tab ${activeTab === 'barters' ? 'active' : ''}`} onClick={() => setActiveTab('barters')}>Предложения</button>
          <button className={`tab ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>Поддержка</button>
          
          <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            🔔 Уведомления 
            {unreadCount > 0 && <span className="admin-badge" style={{background: '#ef4444', marginLeft: '5px', padding: '2px 6px'}}>{unreadCount}</span>}
          </button>

          {currentUser.email === 'admin@mail.ru' && (
            <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Модерация</button>
          )}
        </div>
        
        <div className="tab-content text-left">
          {activeTab === 'notifications' && (
            notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className="list-item" style={{opacity: n.is_read ? 0.6 : 1, background: n.is_read ? '#f8fafc' : '#fff'}}>
                <p><b>Внимание:</b> {n.message}</p>
                {!n.is_read && (
                  <button className="btn-secondary" style={{padding: '5px 10px'}} onClick={() => handleReadNotification(n.id)}>Ок</button>
                )}
              </div>
            )) : <p>У вас нет новых уведомлений.</p>
          )}

          {activeTab === 'myAds' && (
            myAds.length > 0 ? myAds.map(ad => (
              <div key={ad.id} className="list-item">
                <div>
                  <h4>{ad.title} {ad.is_sold && <span className="admin-badge" style={{background: 'gray'}}>Продано</span>}</h4>
                  <p>{ad.price.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  {!ad.is_sold && <button className="btn-barter" style={{padding: '8px 15px'}} onClick={() => handleMarkSold(ad.id)}>Продано</button>}
                  <button className="btn-secondary" style={{padding: '8px 15px'}} onClick={() => { 
                    setEditingAd(ad); setCurrentView('createAd'); 
                  }}>Изменить</button>
                  <button className="btn-danger" style={{padding: '8px 15px'}} onClick={() => handleDeleteAd(ad.id)}>Удалить</button>
                </div>
              </div>
            )) : <p>У вас пока нет объявлений.</p>
          )}
          
          {activeTab === 'barters' && (
            barterOffers.length > 0 ? barterOffers.map(b => (
              <div key={b.id} className="list-item">
                <div><h4>На ваш: {b.target_title}</h4><p>Предлагают: <b>{b.offer_description}</b></p></div>
              </div>
            )) : <p>Вам пока не предлагали обмен.</p>
          )}
          
          {activeTab === 'help' && (
            <div className="support-section">
              <form className="mb-20" onSubmit={createTicket}>
                <h3 style={{marginBottom: '10px'}}>Задать вопрос</h3>
                <input name="subject" placeholder="Опишите вашу проблему..." className="input-field" required />
                <button type="submit" className="btn-primary full-width">Отправить тикет</button>
              </form>
              <h3 style={{marginTop: '30px', marginBottom: '10px'}}>Ваши обращения</h3>
              {myTickets.length > 0 ? myTickets.map(t => (
                <div key={t.id} className="list-item">
                  <div>
                    <h4>Тикет #{t.id}</h4>
                    <p>Вопрос: {t.subject}</p>
                    {t.admin_response && <p style={{color: '#166534', marginTop: '10px'}}><b>Ответ:</b> {t.admin_response}</p>}
                  </div>
                  <span className="admin-badge" style={{background: t.status === 'open' ? '#f59e0b' : 'gray'}}>
                    {t.status === 'open' ? 'В обработке' : 'Закрыт'}
                  </span>
                </div>
              )) : <p className="text-muted">У вас нет активных обращений.</p>}
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="admin-panel">
              <h3 style={{marginBottom: '15px'}}>Все объявления на платформе</h3>
              {allAdsForAdmin.map(ad => (
                <div key={ad.id} className="list-item">
                  <div>
                    <p><b>{ad.title}</b> {ad.is_sold && <span className="admin-badge" style={{background: 'gray'}}>Продано</span>}</p>
                    <p className="text-muted" style={{fontSize: '14px'}}>Продавец: {ad.seller_name}</p>
                    {ad.is_banned && <p style={{color: '#dc2626', fontSize: '14px', marginTop: '5px'}}>Причина бана: {ad.violation_reason}</p>}
                  </div>
                  
                  <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <button className="btn-secondary" style={{padding: '8px 15px'}} onClick={() => { 
                      setEditingAd(ad); setCurrentView('createAd'); 
                    }}>Изменить</button>
                    
                    <button className="btn-danger" style={{padding: '8px 15px'}} onClick={() => handleDeleteAd(ad.id)}>Удалить</button>
                    
                    {!ad.is_banned ? (
                      <button className="btn-danger" style={{padding: '8px 15px'}} onClick={() => handleBan(ad.id)}>Забанить</button>
                    ) : (
                      <span className="admin-badge" style={{background: '#dc2626'}}>Заблокировано</span>
                    )}
                  </div>
                </div>
              ))}

              <h3 style={{marginTop: '40px', marginBottom: '15px'}}>Жалобы и вопросы (Тикеты)</h3>
              {adminTickets.map(t => (
                <div key={t.id} className="list-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <p><b>{t.user_name}:</b> {t.subject}</p>
                  {t.status === 'open' ? (
                    <div className="full-width" style={{marginTop: '15px'}}>
                      <input id={`ans-${t.id}`} className="input-field" placeholder="Напишите ответ пользователю..." />
                      <button className="btn-primary" onClick={() => sendResponse(t.id)}>Ответить и закрыть</button>
                    </div>
                  ) : (
                    <p className="text-muted mt-10">Ваш ответ: {t.admin_response}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};