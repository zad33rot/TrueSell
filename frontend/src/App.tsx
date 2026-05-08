import { useState } from 'react';
import './App.css';

// Типизация для объявления
interface Ad {
  id: number;
  title: string;
  price: number;
  isPrivate: boolean;
  image: string;
}

// Заглушка данных с реальными фото
const mockAds: Ad[] = [
  { 
    id: 1, 
    title: 'Ноутбук ASUS ZenBook 14', 
    price: 55000, 
    isPrivate: true, 
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' 
  },
  { 
    id: 2, 
    title: 'iPhone 13 Pro (Идеальное состояние)', 
    price: 60000, 
    isPrivate: false, 
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80' 
  },
  { 
    id: 3, 
    title: 'Велосипед горный Stern', 
    price: 15000, 
    isPrivate: true, 
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80' 
  },
  { 
    id: 4, 
    title: 'Sony PlayStation 5 + 2 геймпада', 
    price: 48000, 
    isPrivate: false, 
    image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=500&q=80' 
  },
];

function App() {
  const [onlyPrivate, setOnlyPrivate] = useState<boolean>(false);

  const filteredAds = onlyPrivate
    ? mockAds.filter(ad => ad.isPrivate)
    : mockAds;

  return (
    <div className="app-container">
      <header className="header">
        <h1>TrueSell 🛡️</h1>
        <nav>
          <button className="btn-support">Поддержка (Тикеты)</button>
          <button className="btn-primary">Подать объявление</button>
        </nav>
      </header>
      
      <main>
        <section className="filters">
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={onlyPrivate} 
              onChange={(e) => setOnlyPrivate(e.target.checked)} 
            />
            <span>Режим "Только частники" (скрыть магазины)</span>
          </label>
        </section>

        <section className="grid">
          {filteredAds.map(ad => (
            <div key={ad.id} className="card">
              {/* Теперь здесь тег img с реальной фотографией */}
              <img src={ad.image} alt={ad.title} className="card-image" />
              
              <div className="card-content">
                <h3>{ad.title}</h3>
                {/* toLocaleString делает пробелы в тысячах для красоты */}
                <p className="price">{ad.price.toLocaleString('ru-RU')} ₽</p>
                <span className={`badge ${ad.isPrivate ? 'private' : 'business'}`}>
                  {ad.isPrivate ? 'Частное лицо' : 'Магазин'}
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;