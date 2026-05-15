import React, { useState, useEffect } from 'react';
import type { Ad, ViewState, ProfileTab } from './types';
import { Header } from './components/Header';
import { AdCard } from './components/AddCard';
import './App.css';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Состояния для ленты и фильтров
  const [ads, setAds] = useState<any[]>([]);
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false); // Показывает/скрывает выноску настроек
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  
  // Состояния профиля
  const [myAds, setMyAds] = useState<any[]>([]);
  const [barterOffers, setBarterOffers] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('myAds');
  const [authError, setAuthError] = useState('');
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);

  const fetchAds = () => {
    fetch(`${API_URL}/ads?only_private=${onlyPrivate}`).then(res => res.json()).then(setAds);
  };

  const fetchProfileData = () => {
    if (currentUser) {
      fetch(`${API_URL}/ads?user_id=${currentUser.id}`).then(res => res.json()).then(setMyAds);
      fetch(`${API_URL}/barter/${currentUser.id}`).then(res => res.json()).then(setBarterOffers);
      fetch(`${API_URL}/tickets/user/${currentUser.id}`).then(res => res.json()).then(setMyTickets);
      if (currentUser.email === 'admin@mail.ru') {
        fetch(`${API_URL}/tickets`).then(res => res.json()).then(setAdminTickets);
      }
    }
  };

  useEffect(() => { fetchAds(); }, [onlyPrivate, currentView]);
  useEffect(() => { if (currentView === 'profile') fetchProfileData(); }, [currentUser, currentView]);

  const handleLogout = () => { setCurrentUser(null); setCurrentView('home'); };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) { setCurrentUser(await res.json()); setCurrentView('home'); setAuthError(''); } else { setAuthError('Ошибка входа'); }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name }) });
    if (res.ok) { setCurrentUser(await res.json()); setCurrentView('home'); setAuthError(''); } else { setAuthError('Такой email уже существует'); }
  };

  const handleSaveAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const adData = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
      is_private: (form.elements.namedItem('is_private') as HTMLSelectElement).value === 'true',
      can_barter: (form.elements.namedItem('can_barter') as HTMLInputElement).checked,
      image_url: (form.elements.namedItem('image_url') as HTMLInputElement).value || './img/boom.jpg',
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      user_id: currentUser.id
    };
    const res = await fetch(editingAd ? `${API_URL}/ads/${editingAd.id}` : `${API_URL}/ads`, { 
      method: editingAd ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(adData) 
    });
    if (res.ok) { setEditingAd(null); setCurrentView('profile'); fetchProfileData(); }
  };

  const createTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = (e.currentTarget.elements.namedItem('subject') as HTMLInputElement).value;
    await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id, subject })
    });
    e.currentTarget.reset();
    fetchProfileData();
  };

  const handleBarterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const desc = (e.currentTarget.elements.namedItem('offer_desc') as HTMLTextAreaElement).value;
    await fetch(`${API_URL}/barter`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ target_ad_id: selectedAd.id, offered_item_desc: desc }) 
    });
    setShowBarterModal(false);
    setCurrentView('home');
  };

  return (
    <>
      <Header isLoggedIn={!!currentUser} setCurrentView={setCurrentView} onLogout={handleLogout} />
      
      <div className="app-container">
        <main className="main-content">
          
          {/* ГЛАВНАЯ СТРАНИЦА */}
          {currentView === 'home' && (
            <section className="fade-in">
              
              {/* Выпадающее меню настроек */}
              <div className="settings-container">
                <button className="btn-settings" onClick={() => setShowSettings(!showSettings)}>
                  ⚙️ Настройки ленты {showSettings ? '▲' : '▼'}
                </button>
                
                {showSettings && (
                  <div className="settings-dropdown">
                    <h4>Фильтры</h4>
                    <label className="toggle-label">
                      <input type="checkbox" checked={onlyPrivate} onChange={(e) => setOnlyPrivate(e.target.checked)} />
                      <span className="toggle-slider"></span>
                      Только частные лица
                    </label>
                  </div>
                )}
              </div>

              {/* Сетка объявлений */}
              <div className="grid">
                {ads.map(ad => (
                  <AdCard key={ad.id} ad={ad} setSelectedAd={setSelectedAd} setCurrentView={setCurrentView} />
                ))}
              </div>
            </section>
          )}

          {/* СТРАНИЦА ОБЪЯВЛЕНИЯ */}
          {currentView === 'adDetails' && selectedAd && (
            <section className="ad-details fade-in">
              <button className="btn-back" onClick={() => setCurrentView('home')}>← Назад к поиску</button>
              <div className="ad-details-layout">
                <img src={selectedAd.image_url || selectedAd.image} className="ad-gallery" alt={selectedAd.title} />
                <div className="ad-info">
                  <h2>{selectedAd.title}</h2>
                  <p className="ad-price">{selectedAd.price.toLocaleString('ru-RU')} ₽</p>
                  
                  {currentUser ? (
                    <div className="phone-block">
                      <p>Связаться с продавцом:</p>
                      <a href={`tel:${selectedAd.phone}`} className="phone-number">{selectedAd.phone || 'Номер не указан'}</a>
                    </div>
                  ) : (
                    <div className="auth-warning">Войдите, чтобы увидеть номер телефона</div>
                  )}

                  <div className="ad-actions">
                    {currentUser && (selectedAd.can_barter || selectedAd.canBarter) && selectedAd.user_id !== currentUser?.id && (
                      <button className="btn-barter full-width" onClick={() => setShowBarterModal(true)}>🔄 Предложить Смарт-Бартер</button>
                    )}
                  </div>
                  <div className="ad-description">
                    <h3>Описание</h3>
                    <p>{selectedAd.description}</p>
                  </div>
                </div>
              </div>

              {showBarterModal && (
                <div className="modal-overlay" onClick={() => setShowBarterModal(false)}>
                  <form className="modal-content" onClick={e => e.stopPropagation()} onSubmit={handleBarterSubmit}>
                    <h3>Что вы предлагаете на обмен?</h3>
                    <textarea name="offer_desc" placeholder="Опишите ваш товар..." className="input-field barter-input" required />
                    <button type="submit" className="btn-primary full-width">Отправить предложение</button>
                    <button type="button" className="btn-cancel full-width mt-20" onClick={() => setShowBarterModal(false)}>Отмена</button>
                  </form>
                </div>
              )}
            </section>
          )}

          {/* ЛИЧНЫЙ КАБИНЕТ */}
          {currentView === 'profile' && (
            <section className="profile-page fade-in">
              {currentUser ? (
                <div className="profile-dashboard">
                  <h2>Личный кабинет: {currentUser.name}</h2>
                  <div className="tabs">
                    <button className={`tab ${activeTab === 'myAds' ? 'active' : ''}`} onClick={() => setActiveTab('myAds')}>Мои объявления</button>
                    <button className={`tab ${activeTab === 'barters' ? 'active' : ''}`} onClick={() => setActiveTab('barters')}>Предложения</button>
                    <button className={`tab ${activeTab === 'help' ? 'active' : ''}`} onClick={() => setActiveTab('help')}>Поддержка</button>
                    {currentUser.email === 'admin@mail.ru' && (
                      <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Модерация</button>
                    )}
                  </div>
                  
                  <div className="tab-content">
                    {activeTab === 'myAds' && (
                      myAds.length > 0 ? myAds.map(ad => (
                        <div key={ad.id} className="list-item">
                          <div>
                            <h4>{ad.title}</h4>
                            <p>{ad.price.toLocaleString('ru-RU')} ₽</p>
                          </div>
                          <button className="btn-secondary" onClick={() => { setEditingAd(ad); setCurrentView('createAd'); }}>Редактировать</button>
                        </div>
                      )) : <p>У вас пока нет объявлений.</p>
                    )}
                    
                    {activeTab === 'barters' && (
                      barterOffers.length > 0 ? barterOffers.map(b => (
                        <div key={b.id} className="list-item">
                          <div>
                            <h4>На ваш: {b.target_title}</h4>
                            <p>Предлагают: <b>{b.offer_description}</b></p>
                          </div>
                        </div>
                      )) : <p>Вам пока не предлагали обмен.</p>
                    )}
                    
                    {activeTab === 'help' && (
                      <div className="support-section">
                        <form className="mb-20" onSubmit={createTicket}>
                          <h3 style={{textAlign: 'left', marginBottom: '10px'}}>Задать вопрос</h3>
                          <input name="subject" placeholder="Опишите вашу проблему..." className="input-field" required />
                          <button type="submit" className="btn-primary full-width">Отправить тикет</button>
                        </form>
                        <h3 style={{textAlign: 'left', marginTop: '30px', marginBottom: '10px'}}>Ваши обращения</h3>
                        {myTickets.length > 0 ? myTickets.map(t => (
                          <div key={t.id} className="list-item">
                            <div>
                              <h4>Тикет #{t.id}</h4>
                              <p>{t.subject}</p>
                            </div>
                            <span className="admin-badge" style={{background: t.status === 'open' ? '#f59e0b' : 'gray'}}>
                              {t.status === 'open' ? 'В обработке' : 'Закрыт'}
                            </span>
                          </div>
                        )) : <p className="text-muted">У вас нет активных обращений.</p>}
                      </div>
                    )}

                    {activeTab === 'admin' && adminTickets.map(t => (
                      <div key={t.id} className="list-item">
                        <div>
                          <h4>#{t.id} от {t.user_name}</h4>
                          <p>{t.subject}</p>
                        </div>
                        {t.status === 'open' ? (
                          <button className="btn-danger" onClick={async () => { 
                            await fetch(`${API_URL}/tickets/${t.id}/close`, { method: 'PUT' }); 
                            fetch(`${API_URL}/tickets`).then(res => res.json()).then(setAdminTickets); 
                          }}>Закрыть</button>
                        ) : (
                          <span className="admin-badge" style={{background: 'gray'}}>Закрыт</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleLogin}>
                  <h2>Вход</h2>
                  {authError && <p className="error-text">{authError}</p>}
                  <input type="email" name="email" placeholder="Email" className="input-field" required />
                  <input type="password" name="password" placeholder="Пароль" className="input-field" required />
                  <button type="submit" className="btn-primary full-width">Войти</button>
                  <p className="mt-20">Нет аккаунта? <span className="link" onClick={() => setCurrentView('register')}>Регистрация</span></p>
                </form>
              )}
            </section>
          )}

          {/* РЕГИСТРАЦИЯ */}
          {currentView === 'register' && (
            <section className="profile-page fade-in">
              <form className="auth-form" onSubmit={handleRegister}>
                <h2>Регистрация</h2>
                {authError && <p className="error-text">{authError}</p>}
                <input type="text" name="name" placeholder="Имя" className="input-field" required />
                <input type="email" name="email" placeholder="Email" className="input-field" required />
                <input type="password" name="password" placeholder="Пароль" className="input-field" required />
                <button type="submit" className="btn-primary full-width">Создать аккаунт</button>
                <p className="mt-20">Есть аккаунт? <span className="link" onClick={() => setCurrentView('profile')}>Войти</span></p>
              </form>
            </section>
          )}

          {/* СОЗДАНИЕ / РЕДАКТИРОВАНИЕ ОБЪЯВЛЕНИЯ */}
          {currentView === 'createAd' && (
            <section className="fade-in">
              <button className="btn-cancel" onClick={() => { setEditingAd(null); setCurrentView('profile'); }}>← Отмена</button>
              <form className="auth-form mx-auto max-w-500" onSubmit={handleSaveAd}>
                <h2>{editingAd ? 'Редактировать' : 'Новое объявление'}</h2>
                <input type="text" name="title" defaultValue={editingAd?.title} placeholder="Название" className="input-field" required />
                <textarea name="description" defaultValue={editingAd?.description} placeholder="Описание" className="input-field" style={{height: '100px'}} required />
                <input type="number" name="price" defaultValue={editingAd?.price} placeholder="Цена" className="input-field" required />
                <input type="text" name="phone" defaultValue={editingAd?.phone} placeholder="Ваш номер (напр. +7 999...)" className="input-field" required />
                <input type="text" name="image_url" defaultValue={editingAd?.image_url} placeholder="URL фото (опционально)" className="input-field" />
                <select name="is_private" defaultValue={editingAd ? String(editingAd.is_private) : 'true'} className="input-field">
                  <option value="true">Частное лицо</option>
                  <option value="false">Магазин</option>
                </select>
                <div className="flex-start mt-20 mb-20">
                  <label className="toggle-label">
                    <input type="checkbox" name="can_barter" defaultChecked={editingAd?.can_barter} />
                    <span className="toggle-slider"></span>
                    Согласен на Смарт-Бартер
                  </label>
                </div>
                <button type="submit" className="btn-primary full-width">Сохранить</button>
              </form>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default App;