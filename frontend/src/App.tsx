import React, { useState } from 'react';
import type { Ad, ViewState, ProfileTab } from './types';
import { Header } from './components/Header';
import { AdCard } from './components/AddCard';
import './App.css';

const mockAds: Ad[] = [
  { id: 1, title: 'Ноутбук ASUS ZenBook 14', price: 55000, isPrivate: true, image: './img/boom.jpg', description: 'Отличный ультрабук для учебы. Возможен обмен на планшет.', sellerName: 'Алексей', canBarter: true },
  { id: 2, title: 'iPhone 13 Pro', price: 60000, isPrivate: false, image: './img/boom.jpg', description: 'Витринный образец. Гарантия.', sellerName: 'Магазин iStore', canBarter: false },
  { id: 3, title: 'Велосипед горный Stern', price: 15000, isPrivate: true, image: './img/boom.jpg', description: 'Рама алюминиевая. Обмен на самокат.', sellerName: 'Мария', canBarter: true }
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('myAds');
  const [authError, setAuthError] = useState('');
  const [adFormError, setAdFormError] = useState('');
  const [showBarterModal, setShowBarterModal] = useState(false);

  const filteredAds = onlyPrivate ? mockAds.filter(ad => ad.isPrivate) : mockAds;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!email.includes('@') || password.length < 6) {
      setAuthError('Ошибка: Некорректный email или пароль короче 6 символов');
      return;
    }
    setAuthError('');
    setIsLoggedIn(true);
  };

  const handleCreateAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const price = Number((form.elements.namedItem('price') as HTMLInputElement).value);

    if (title.length < 5 || price <= 0) {
      setAdFormError('Название должно быть длиннее 5 символов, а цена больше 0');
      return;
    }
    alert('Объявление успешно опубликовано!');
    setCurrentView('home');
  };

  const handleBarterSubmit = () => {
    alert('Предложение обмена отправлено продавцу!');
    setShowBarterModal(false);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setCurrentView={setCurrentView} />
      
      <div className="app-container">
        <main className="main-content">
          
          {currentView === 'home' && (
            <section className="fade-in">
              <div className="filters">
                <label className="toggle-label">
                  <input type="checkbox" checked={onlyPrivate} onChange={(e) => setOnlyPrivate(e.target.checked)} />
                  <span className="toggle-slider"></span>
                  Только частные лица (Анти-бизнес)
                </label>
              </div>
              <div className="grid">
                {filteredAds.map(ad => (
                  <AdCard 
                    key={ad.id} 
                    ad={ad} 
                    setSelectedAd={setSelectedAd} 
                    setCurrentView={setCurrentView} 
                  />
                ))}
              </div>
            </section>
          )}

          {currentView === 'adDetails' && selectedAd && (
            <section className="ad-details fade-in">
              <button className="btn-back" onClick={() => setCurrentView('home')}>
                <span></span> Назад к поиску
              </button>
              <div className="ad-details-layout">
                <img src={selectedAd.image} alt={selectedAd.title} className="ad-gallery" />
                <div className="ad-info">
                  <h2>{selectedAd.title}</h2>
                  <p className="ad-price">{selectedAd.price.toLocaleString('ru-RU')} ₽</p>
                  <div className="ad-seller">
                    <p className="seller-name">Продавец: <b>{selectedAd.sellerName}</b></p>
                  </div>
                  
                  <div className="ad-actions">
                    {isLoggedIn ? (
                      <>
                        <button className="btn-primary full-width">Показать телефон</button>
                        {selectedAd.canBarter && (
                          <button className="btn-barter full-width" onClick={() => setShowBarterModal(true)}>
                            🔄 Предложить Смарт-бартер
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="auth-warning">Войдите, чтобы увидеть контакты или предложить обмен.</div>
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
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3>Предложить обмен</h3>
                    <p style={{marginTop: '10px', marginBottom: '15px'}}>Выберите ваш товар для смарт-бартера на <b>{selectedAd.title}</b>:</p>
                    <select className="input-field" style={{marginBottom: '20px'}}>
                      <option>Мой старый смартфон</option>
                      <option>Коллекция книг</option>
                    </select>
                    <button className="btn-primary full-width" onClick={handleBarterSubmit}>Отправить предложение</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {currentView === 'profile' && (
            <section className="profile-page fade-in">
              {isLoggedIn ? (
                <div className="profile-dashboard">
                  <h2>Личный кабинет</h2>
                  <div className="tabs">
                    <button className={`tab ${activeTab === 'myAds' ? 'active' : ''}`} onClick={() => setActiveTab('myAds')}>Мои объявления</button>
                    <button className={`tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>Служба поддержки</button>
                  </div>

                  <div className="tab-content">
                    {activeTab === 'myAds' && <p>У вас пока нет активных объявлений. Самое время создать!</p>}
                    {activeTab === 'tickets' && (
                      <div className="ticket-section">
                        <p>Здесь вы можете открыть спор или задать вопрос модератору.</p>
                        <button className="btn-secondary" style={{marginTop: '15px'}}>Создать тикет</button>
                      </div>
                    )}
                  </div>
                  <button className="btn-danger" style={{marginTop: '30px'}} onClick={() => setIsLoggedIn(false)}>Выйти</button>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleLogin}>
                  <h2>Вход в систему</h2>
                  {authError && <p className="error-text">{authError}</p>}
                  <label className="form-label" style={{textAlign: 'left'}}>Email</label>
                  <input type="email" name="email" placeholder="example@mail.com" className="input-field" required />
                  
                  <label className="form-label" style={{textAlign: 'left'}}>Пароль</label>
                  <input type="password" name="password" placeholder="От 6 символов" className="input-field" required />
                  
                  <button type="submit" className="btn-primary full-width" style={{marginTop: '10px'}}>Войти</button>
                </form>
              )}
            </section>
          )}

          {currentView === 'createAd' && (
            <section className="fade-in create-ad-section">
              <button className="btn-back" onClick={() => setCurrentView('home')}>
                <span>←</span> Отмена
              </button>
              <form className="auth-form" onSubmit={handleCreateAd} style={{marginTop: '0'}}>
                <h2>Новое объявление</h2>
                {adFormError && <p className="error-text">{adFormError}</p>}
                
                <label className="form-label" style={{textAlign: 'left'}}>Название товара</label>
                <input type="text" name="title" className="input-field" placeholder="Например: Планшет iPad" required />
                
                <label className="form-label" style={{textAlign: 'left'}}>Цена (₽)</label>
                <input type="number" name="price" className="input-field" placeholder="0" required />
                
                <div style={{display: 'flex', justifyContent: 'flex-start', marginTop: '10px', marginBottom: '20px'}}>
                  <label className="toggle-label">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                    Готов рассмотреть Смарт-бартер
                  </label>
                </div>

                <button type="submit" className="btn-primary full-width">Опубликовать</button>
              </form>
            </section>
          )}

        </main>
      </div>
    </>
  );
}

export default App;