import React from 'react';
import type { ViewState } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  setCurrentView: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, setCurrentView }) => {
  return (
    <header className="header">
      <h1 className="logo" onClick={() => setCurrentView('home')}>TrueSell</h1>
      <nav className="nav-buttons">
        <button className="btn-secondary" onClick={() => setCurrentView('profile')}>
          {isLoggedIn ? '👤 Профиль' : 'Войти'}
        </button>
        <button className="btn-primary" onClick={() => isLoggedIn ? setCurrentView('createAd') : setCurrentView('profile')}>
          Подать объявление
        </button>
      </nav>
    </header>
  );
};