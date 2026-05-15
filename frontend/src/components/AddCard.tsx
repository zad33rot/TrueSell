import React from 'react';
import type { ViewState } from '../types';

interface AdCardProps {
  ad: any;
  setSelectedAd: (ad: any) => void;
  setCurrentView: (view: ViewState) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, setSelectedAd, setCurrentView }) => {
  const handleClick = () => {
    setSelectedAd(ad);
    setCurrentView('adDetails');
  };

  const isPriv = ad.is_private !== undefined ? ad.is_private : ad.isPrivate;
  const canBart = ad.can_barter !== undefined ? ad.can_barter : ad.canBarter;
  const img = ad.image_url || ad.image;

  return (
    <article className="card" onClick={handleClick} style={{ opacity: ad.is_sold ? 0.7 : 1 }}>
      <img src={img} alt={ad.title} className="card-image" />
      <div className="card-content">
        <h3>{ad.title}</h3>
        <p className="price">{ad.price.toLocaleString('ru-RU')} ₽</p>
        <div className="badges">
          {ad.is_sold ? (
            <span className="badge" style={{background: '#94a3b8', color: 'white'}}>Продано</span>
          ) : (
            <>
              <span className={`badge ${isPriv ? 'private' : 'business'}`}>
                {isPriv ? 'Частник' : 'Магазин'}
              </span>
              {canBart && <span className="badge barter">🔄 Возможен обмен</span>}
            </>
          )}
        </div>
      </div>
    </article>
  );
};