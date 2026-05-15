import React, { useState } from 'react';
import type { ViewState } from './types';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { AdDetails } from './pages/AdDetails';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { CreateAd } from './pages/CreateAd';
import './App.css';

function App() {
  // состояния
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  return (
    <>
      <Header isLoggedIn={!!currentUser} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <div className="app-container">
        <main className="main-content">
          
          {currentView === 'home' && (
            <Home setCurrentView={setCurrentView} setSelectedAd={setSelectedAd} />
          )}

          {currentView === 'adDetails' && selectedAd && (
            <AdDetails ad={selectedAd} currentUser={currentUser} setCurrentView={setCurrentView} />
          )}

          {currentView === 'profile' && currentUser && (
            <Profile currentUser={currentUser} setCurrentView={setCurrentView} setEditingAd={setEditingAd} />
          )}

          {(currentView === 'profile' || currentView === 'register') && !currentUser && (
            <Auth currentView={currentView} setCurrentView={setCurrentView} setCurrentUser={setCurrentUser} />
          )}

          {currentView === 'createAd' && currentUser && (
            <CreateAd currentUser={currentUser} editingAd={editingAd} setCurrentView={setCurrentView} setEditingAd={setEditingAd} />
          )}

        </main>
      </div>
    </>
  );
}

export default App;