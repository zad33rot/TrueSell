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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('home');
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (!email.includes('@') || password.length < 6) {
      setAuthError('Неверный логин или пароль');
      return;
    }
    setAuthError('');
    setIsLoggedIn(true);
    setCurrentView('home');
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Аккаунт успешно создан!');
    setIsLoggedIn(true);
    setCurrentView('home');
  };

  const handleCreateAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const price = Number((form.elements.namedItem('price') as HTMLInputElement).value);

    if (title.length < 5 || price <= 0) {
      setAdFormError('Проверьте корректность данных');
      return;
    }
    alert('Опубликовано!');
    setCurrentView('home');
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} setCurrentView={setCurrentView} onLogout={handleLogout} />
      
      <div className="app-container">
        <main className="main-content">
          {currentView === 'home' && (
            <section className="fade-in">
              <div className="filters">
                <label className="toggle-label">
                  <input type="checkbox" checked={onlyPrivate} onChange={(e) => setOnlyPrivate(e.target.checked)} />
                  <span className="toggle-slider"></span>
                  Только частные лица
                </label>
              </div>
              <div className="grid">
                {filteredAds.map(ad => (
                  <AdCard key={ad.id} ad={ad} setSelectedAd={setSelectedAd} setCurrentView={setCurrentView} />
                ))}
              </div>
            </section>
          )}

          {currentView === 'adDetails' && selectedAd && (
            <section className="ad-details fade-in">
              <button className="btn-back" onClick={() => setCurrentView('home')}>Назад</button>
              <div className="ad-details-layout">
                <img src={selectedAd.image} alt={selectedAd.title} className="ad-gallery" />
                <div className="ad-info">
                  <h2>{selectedAd.title}</h2>
                  <p className="ad-price">{selectedAd.price.toLocaleString('ru-RU')} ₽</p>
                  <div className="ad-seller">
                    <p>Продавец: <b>{selectedAd.sellerName}</b></p>
                  </div>
                  <div className="ad-actions">
                    {isLoggedIn ? (
                      <>
                        <button className="btn-primary full-width">Показать телефон</button>
                        {selectedAd.canBarter && (
                          <button className="btn-barter full-width" onClick={() => setShowBarterModal(true)}>🔄 Бартер</button>
                        )}
                      </>
                    ) : (
                      <div className="auth-warning">Войдите для просмотра контактов</div>
                    )}
                  </div>
                  <div className="ad-description">
                    <h3>Описание</h3>
                    <p>{selectedAd.description}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentView === 'profile' && (
            <section className="profile-page fade-in">
              {isLoggedIn ? (
                <div className="profile-dashboard">
                  <h2>Личный кабинет</h2>
                  <div className="tabs">
                    <button className={`tab ${activeTab === 'myAds' ? 'active' : ''}`} onClick={() => setActiveTab('myAds')}>Объявления</button>
                    <button className={`tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>Поддержка</button>
                  </div>
                  <div className="tab-content">
                    {activeTab === 'myAds' ? <p>Список пуст</p> : <p>Нет активных тикетов</p>}
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

          {currentView === 'register' && (
            <section className="profile-page fade-in">
              <form className="auth-form" onSubmit={handleRegister}>
                <h2>Регистрация</h2>
                <input type="text" placeholder="Ваше имя" className="input-field" required />
                <input type="email" placeholder="Email" className="input-field" required />
                <input type="password" placeholder="Пароль" className="input-field" required />
                <button type="submit" className="btn-primary full-width">Создать аккаунт</button>
                <p className="mt-20">Уже есть аккаунт? <span className="link" onClick={() => setCurrentView('profile')}>Войти</span></p>
              </form>
            </section>
          )}

          {currentView === 'createAd' && (
            <section className="fade-in">
              <form className="auth-form mx-auto max-w-500" onSubmit={handleCreateAd}>
                <h2>Новое объявление</h2>
                <input type="text" name="title" placeholder="Название" className="input-field" required />
                <input type="number" name="price" placeholder="Цена" className="input-field" required />
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