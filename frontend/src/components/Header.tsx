import React from 'react';
import type { ViewState } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  setCurrentView: (view: ViewState) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, setCurrentView, onLogout }) => {
  return (
    <header className="header">
      <h1 className="logo" onClick={() => setCurrentView('home')}>TrueSell</h1>
      <nav className="nav-buttons">
        {isLoggedIn ? (
          <>
            <button className="btn-secondary" onClick={() => setCurrentView('profile')}>👤 Профиль</button>
            <button className="btn-danger" onClick={onLogout}>Выйти</button>
          </>
        ) : (
          <button className="btn-secondary" onClick={() => setCurrentView('profile')}>Войти</button>
        )}
        <button className="btn-primary" onClick={() => isLoggedIn ? setCurrentView('createAd') : setCurrentView('profile')}>
          Подать объявление
        </button>
      </nav>
    </header>
  );
};