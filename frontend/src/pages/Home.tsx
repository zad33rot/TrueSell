import React, { useState, useEffect } from 'react';
import type { ViewState } from '../types';
import { AdCard } from '../components/AddCard';

const API_URL = 'http://localhost:8000/api';

interface HomeProps {
  setCurrentView: (view: ViewState) => void;
  setSelectedAd: (ad: any) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentView, setSelectedAd }) => {
  const [ads, setAds] = useState<any[]>([]);
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_URL}/ads?only_private=${onlyPrivate}`)
      .then(res => res.json())
      .then(setAds);
  }, [onlyPrivate]);

  return (
    <section className="fade-in">
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
              Только частники
            </label>
          </div>
        )}
      </div>
      <div className="grid">
        {ads.map(ad => (
          <AdCard key={ad.id} ad={ad} setSelectedAd={setSelectedAd} setCurrentView={setCurrentView} />
        ))}
      </div>
    </section>
  );
};