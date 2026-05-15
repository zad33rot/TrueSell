import React, { useState } from 'react';
import type { ViewState } from '../types';

const API_URL = 'http://localhost:8000/api';

interface CreateAdProps {
  currentUser: any;
  editingAd: any;
  setCurrentView: (view: ViewState) => void;
  setEditingAd: (ad: any) => void;
}

export const CreateAd: React.FC<CreateAdProps> = ({ currentUser, editingAd, setCurrentView, setEditingAd }) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(editingAd?.image_url || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
    if (res.ok) { 
      const data = await res.json(); 
      setUploadedImageUrl(data.url); 
    }
  };

  const handleSaveAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const finalImage = uploadedImageUrl || '/img/boom.jpg';
    const ownerId = editingAd ? (editingAd.user_id || currentUser.id) : currentUser.id;

    const adData = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
      is_private: (form.elements.namedItem('is_private') as HTMLSelectElement).value === 'true',
      can_barter: (form.elements.namedItem('can_barter') as HTMLInputElement).checked,
      image_url: finalImage,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      user_id: ownerId
    };

    const res = await fetch(editingAd ? `${API_URL}/ads/${editingAd.id}` : `${API_URL}/ads`, { 
      method: editingAd ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(adData) 
    });
    
    if (res.ok) { 
      setEditingAd(null); 
      setCurrentView('profile'); 
    }
  };

  return (
    <section className="fade-in">
      <button className="btn-cancel" onClick={() => { setEditingAd(null); setCurrentView('profile'); }}>Отмена</button>
      <form className="auth-form mx-auto max-w-500" onSubmit={handleSaveAd}>
        <h2>{editingAd ? 'Редактировать' : 'Новое объявление'}</h2>
        
        <input type="text" name="title" defaultValue={editingAd?.title} placeholder="Название" className="input-field" required />
        <textarea name="description" defaultValue={editingAd?.description} placeholder="Описание" className="input-field" style={{height: '100px'}} required />
        <input type="number" name="price" defaultValue={editingAd?.price} placeholder="Цена" className="input-field" required />
        <input type="text" name="phone" defaultValue={editingAd?.phone} placeholder="Ваш номер (напр. +7 999...)" className="input-field" required />
        
        <label className="form-label" style={{textAlign: 'left'}}>Фотография товара</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="input-field" style={{padding: '10px'}} />
        {uploadedImageUrl && (
          <div style={{marginBottom: '20px', textAlign: 'left'}}>
            <img src={uploadedImageUrl} alt="preview" style={{width: '120px', borderRadius: '8px', objectFit: 'cover'}} />
          </div>
        )}

        <select name="is_private" defaultValue={editingAd ? String(editingAd.is_private) : 'true'} className="input-field">
          <option value="true">Частное лицо</option>
          <option value="false">Магазин</option>
        </select>
        
        <div className="flex-start mt-20 mb-20">
          <label className="toggle-label">
            <input type="checkbox" name="can_barter" defaultChecked={editingAd?.can_barter} />
            <span className="toggle-slider"></span>
            Согласен на Смарт-Бартер
          </label>
        </div>
        
        <button type="submit" className="btn-primary full-width">Сохранить</button>
      </form>
    </section>
  );
};