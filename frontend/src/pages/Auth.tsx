import React, { useState } from 'react';
import type { ViewState } from '../types';

const API_URL = 'http://localhost:8000/api';

interface AuthProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  setCurrentUser: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ currentView, setCurrentView, setCurrentUser }) => {
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    const res = await fetch(`${API_URL}/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, password }) 
    });
    
    if (res.ok) { 
      setCurrentUser(await res.json()); 
      setCurrentView('home'); 
      setAuthError(''); 
    } else { 
      setAuthError('Ошибка входа'); 
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    const res = await fetch(`${API_URL}/register`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email, password, name }) 
    });
    
    if (res.ok) { 
      setCurrentUser(await res.json()); 
      setCurrentView('home'); 
      setAuthError(''); 
    } else { 
      setAuthError('Такой email уже существует'); 
    }
  };

  if (currentView === 'register') {
    return (
      <section className="profile-page fade-in">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Регистрация</h2>
          {authError && <p className="error-text">{authError}</p>}
          <input type="text" name="name" placeholder="Имя" className="input-field" required />
          <input type="email" name="email" placeholder="Email" className="input-field" required />
          <input type="password" name="password" placeholder="Пароль" className="input-field" required />
          <button type="submit" className="btn-primary full-width">Создать аккаунт</button>
          <p className="mt-20 text-center">Есть аккаунт? <span className="link" onClick={() => setCurrentView('profile')}>Войти</span></p>
        </form>
      </section>
    );
  }

  return (
    <section className="profile-page fade-in">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Вход</h2>
        {authError && <p className="error-text">{authError}</p>}
        <input type="email" name="email" placeholder="Email" className="input-field" required />
        <input type="password" name="password" placeholder="Пароль" className="input-field" required />
        <button type="submit" className="btn-primary full-width">Войти</button>
        <p className="mt-20 text-center">Нет аккаунта? <span className="link" onClick={() => setCurrentView('register')}>Регистрация</span></p>
      </form>
    </section>
  );
};