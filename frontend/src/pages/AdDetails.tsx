import React, { useState } from 'react';
import type { ViewState } from '../types';

const API_URL = 'http://localhost:8000/api';

interface AdDetailsProps {
  ad: any;
  currentUser: any;
  setCurrentView: (view: ViewState) => void;
}

export const AdDetails: React.FC<AdDetailsProps> = ({ ad, currentUser, setCurrentView }) => {
  const [showBarterModal, setShowBarterModal] = useState(false);

  const handleBarterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const desc = (e.currentTarget.elements.namedItem('offer_desc') as HTMLTextAreaElement).value;
    await fetch(`${API_URL}/barter`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ target_ad_id: ad.id, offered_item_desc: desc }) 
    });
    setShowBarterModal(false);
    alert('Предложение отправлено!');
    setCurrentView('home');
  };

  return (
    <section className="ad-details fade-in">
      <button className="btn-back" onClick={() => setCurrentView('home')}>Назад к поиску</button>
      <div className="ad-details-layout">
        <img src={ad.image_url || ad.image} className="ad-gallery" alt={ad.title} />
        <div className="ad-info">
          <h2>{ad.title}</h2>
          <p className="ad-price">{ad.price.toLocaleString('ru-RU')} ₽</p>
          
          {ad.is_sold && <div className="auth-warning mb-20" style={{background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1'}}>Этот товар уже продан</div>}

          {currentUser ? (
            <div className="phone-block">
              <p>Связаться с продавцом:</p>
              <a href={`tel:${ad.phone}`} className="phone-number">{ad.phone || 'Номер не указан'}</a>
            </div>
          ) : (
            <div className="auth-warning">Войдите, чтобы увидеть номер телефона</div>
          )}

          <div className="ad-actions">
            {currentUser && (ad.can_barter || ad.canBarter) && ad.user_id !== currentUser?.id && !ad.is_sold && (
              <button className="btn-barter full-width" onClick={() => setShowBarterModal(true)}>🔄 Предложить Бартер</button>
            )}
          </div>
          <div className="ad-description">
            <h3>Описание</h3>
            <p>{ad.description}</p>
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
  );
};