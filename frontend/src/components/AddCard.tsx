import React from 'react';
import type { Ad, ViewState } from '../types';

interface AdCardProps {
  ad: Ad;
  setSelectedAd: (ad: Ad) => void;
  setCurrentView: (view: ViewState) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, setSelectedAd, setCurrentView }) => {
  const handleClick = () => {
    setSelectedAd(ad);
    setCurrentView('adDetails');
  };

  return (
    <article className="card" onClick={handleClick}>
      <img src={ad.image} alt={ad.title} className="card-image" />
      <div className="card-content">
        <h3>{ad.title}</h3>
        <p className="price">{ad.price.toLocaleString('ru-RU')} ₽</p>
        <div className="badges">
          <span className={`badge ${ad.isPrivate ? 'private' : 'business'}`}>
            {ad.isPrivate ? 'Частник' : 'Магазин'}
          </span>
          {ad.canBarter && <span className="badge barter">🔄 Возможен обмен</span>}
        </div>
      </div>
    </article>
  );
};