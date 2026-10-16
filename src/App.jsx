import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Lock, Plus, Trash2, Calendar, Newspaper, FolderPlus, Image as ImageIcon, LogOut, Edit3, Info, Upload } from 'lucide-react';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('news');

  const [newsList, setNewsList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [albumsList, setAlbumsList] = useState([]);

  // Новини
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDate, setNewsDate] = useState('');
  const [newsCategory, setNewsCategory] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImage, setNewsImage] = useState('');

  // Розклад
  const [editingSchId, setEditingSchId] = useState(null);
  const [schDayOfWeek, setSchDayOfWeek] = useState('Неділя');
  const [schDay, setSchDay] = useState(new Date().getDate());
  const [schMonth, setSchMonth] = useState(new Date().getMonth() + 1);
  const [schYear, setSchYear] = useState(new Date().getFullYear());
  const [schTime, setSchTime] = useState('');
  const [schService, setSchService] = useState('');
  const [schDesc, setSchDesc] = useState('');
  const [isWeekly, setIsWeekly] = useState(false);

  // Фотоальбом
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumSubtitle, setAlbumSubtitle] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [photosList, setPhotosList] = useState([{ url: '', title: '' }]);

  // Інформація та Контакти
  const [churchTitle, setChurchTitle] = useState('');
  const [churchCity, setChurchCity] = useState('');
  const [churchAddress, setChurchAddress] = useState('');
  const [churchPhone, setChurchPhone] = useState('');
  const [churchEmail, setChurchEmail] = useState('');
  const [churchRector, setChurchRector] = useState('');
  const [churchHours, setChurchHours] = useState('');
  const [infoTitle, setInfoTitle] = useState('');
  const [infoContent, setInfoContent] = useState('');
  const [infoImage, setInfoImage] = useState('');

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const newsSnap = await getDocs(collection(db, "news"));
      setNewsList(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const schSnap = await getDocs(collection(db, "schedule"));
      setScheduleList(schSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const albumsSnap = await getDocs(collection(db, "photoAlbums"));
      setAlbumsList(albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const infoSnap = await getDoc(doc(db, "settings", "churchInfo"));
      if (infoSnap.exists()) {
        const data = infoSnap.data();
        setChurchTitle(data.title || '');
        setChurchCity(data.city || '');
        setChurchAddress(data.address || '');
        setChurchPhone(data.phone || '');
        setChurchEmail(data.email || '');
        setChurchRector(data.rector || '');
        setChurchHours(data.workingHours || '');
        setInfoTitle(data.infoTitle || '');
        setInfoContent(data.infoContent || '');
        setInfoImage(data.infoImage || '');
      }
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "1234") setIsAuthenticated(true);
    else alert("Невірний пароль!");
  };

  // ФУНКЦІЯ АВТОМАТИЧНОГО СТИСНЕННЯ ЗОБРАЖЕННЯ (до розміру ~150-250 КБ)
  const handleFileChange = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Стиснення якості зображення
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          callback(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Збереження новини
  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newsImage) { alert("Виберіть зображення!"); return; }
    try {
      const newsData = {
        title: newsTitle, date: newsDate, category: newsCategory,
        summary: newsSummary, content: newsContent, image: newsImage,
        createdAt: serverTimestamp()
      };

      if (editingNewsId) {
        await updateDoc(doc(db, "news", editingNewsId), newsData);
        alert("Новину оновлено!");
      } else {
        await addDoc(collection(db, "news"), newsData);
        alert("Новину додано!");
      }

      setEditingNewsId(null); setNewsTitle(''); setNewsDate(''); setNewsCategory(''); setNewsSummary(''); setNewsContent(''); setNewsImage('');
      loadData();
    } catch (err) { alert("Помилка: " + err.message); }
  };

  const handleEditNews = (item) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title || '');
    setNewsDate(item.date || '');
    setNewsCategory(item.category || '');
    setNewsSummary(item.summary || '');
    setNewsContent(item.content || '');
    setNewsImage(item.image || '');
  };

  const handleDeleteNews = async (id) => {
    if (confirm("Видалити новину?")) { await deleteDoc(doc(db, "news", id)); loadData(); }
  };

  // Збереження розкладу
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const schData = {
        dayOfWeek: schDayOfWeek,
        day: Number(schDay),
        month: Number(schMonth),
        year: Number(schYear),
        time: schTime,
        service: schService,
        desc: schDesc,
        isWeekly: isWeekly,
        createdAt: serverTimestamp()
      };

      if (editingSchId) {
        await updateDoc(doc(db, "schedule", editingSchId), schData);
        alert("Розклад оновлено!");
      } else {
        await addDoc(collection(db, "schedule"), schData);
        alert("Розклад додано!");
      }

      setEditingSchId(null); setSchTime(''); setSchService(''); setSchDesc(''); setIsWeekly(false);
      loadData();
    } catch (err) { alert("Помилка: " + err.message); }
  };

  const handleEditSchedule = (item) => {
    setEditingSchId(item.id);
    setSchDayOfWeek(item.dayOfWeek || 'Неділя');
    setSchDay(item.day || new Date().getDate());
    setSchMonth(item.month || new Date().getMonth() + 1);
    setSchYear(item.year || new Date().getFullYear());
    setSchTime(item.time || '');
    setSchService(item.service || '');
    setSchDesc(item.desc || '');
    setIsWeekly(!!item.isWeekly);
  };

  const handleDeleteSchedule = async (id) => {
    if (confirm("Видалити запис?")) { await deleteDoc(doc(db, "schedule", id)); loadData(); }
  };

  // Збереження альбому
  const handleSaveAlbum = async (e) => {
    e.preventDefault();
    if (!albumCover) { alert("Виберіть обкладинку альбому!"); return; }
    try {
      const formattedPhotos = photosList
        .filter(item => item.url.trim() !== '')
        .map((item, idx) => ({ id: 'p-' + Date.now() + '-' + idx, url: item.url.trim(), title: item.title.trim() || albumTitle }));

      const albumData = {
        title: albumTitle, subtitle: albumSubtitle, cover: albumCover, date: albumDate,
        photos: formattedPhotos, createdAt: serverTimestamp()
      };

      if (editingAlbumId) {
        await updateDoc(doc(db, "photoAlbums", editingAlbumId), albumData);
        alert("Альбом оновлено!");
      } else {
        await addDoc(collection(db, "photoAlbums"), albumData);
        alert("Альбом створено!");
      }

      setEditingAlbumId(null); setAlbumTitle(''); setAlbumSubtitle(''); setAlbumCover(''); setAlbumDate('');
      setPhotosList([{ url: '', title: '' }]);
      loadData();
    } catch (err) { alert("Помилка: " + err.message); }
  };

  const handleEditAlbum = (album) => {
    setEditingAlbumId(album.id);
    setAlbumTitle(album.title || '');
    setAlbumSubtitle(album.subtitle || '');
    setAlbumCover(album.cover || '');
    setAlbumDate(album.date || '');
    setPhotosList(album.photos && album.photos.length > 0 ? album.photos : [{ url: '', title: '' }]);
  };

  const handleDeleteAlbum = async (id) => {
    if (confirm("Видалити альбом?")) { await deleteDoc(doc(db, "photoAlbums", id)); loadData(); }
  };

  const handlePhotoFileChangeInAlbum = (e, index) => {
    handleFileChange(e, (compressedBase64) => {
      const updated = [...photosList];
      updated[index].url = compressedBase64;
      setPhotosList(updated);
    });
  };

  // Збереження Інформації та Контактів
  const handleSaveChurchInfo = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "churchInfo"), {
        title: churchTitle,
        city: churchCity,
        address: churchAddress,
        phone: churchPhone,
        email: churchEmail,
        rector: churchRector,
        workingHours: churchHours,
        infoTitle: infoTitle,
        infoContent: infoContent,
        infoImage: infoImage
      });
      alert("Інформацію успішно збережено!");
    } catch (err) { alert("Помилка: " + err.message); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-3xl border border-stone-800 max-w-sm w-full space-y-5 text-white shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-600/25 border border-amber-500/30 text-amber-300 rounded-full flex items-center justify-center mx-auto"><Lock className="w-6 h-6" /></div>
            <h1 className="text-xl font-serif font-bold">Адмін-панель Храму</h1>
          </div>
          <input type="password" placeholder="Пароль (1234)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-stone-700 text-sm focus:outline-none focus:border-amber-500 text-center tracking-widest" />
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 font-semibold py-3 rounded-xl transition text-sm cursor-pointer">Увійти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-950 text-white border-b border-stone-800 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-serif font-bold text-lg text-amber-200">Панель управління</h1>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center space-x-1.5 text-xs text-stone-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-stone-800 cursor-pointer">
          <LogOut className="w-3.5 h-3.5" /><span>Вийти</span>
        </button>
      </header>

      <div className="bg-white border-b border-stone-200 px-6 flex space-x-4 shadow-sm overflow-x-auto">
        {[
          { id: 'news', label: 'Новини', icon: Newspaper }, 
          { id: 'schedule', label: 'Розклад', icon: Calendar }, 
          { id: 'gallery', label: 'Фототека', icon: ImageIcon },
          { id: 'info', label: 'Інформація та Контакти', icon: Info }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'border-amber-600 text-amber-800 font-bold' : 'border-transparent text-stone-600 hover:text-slate-900'}`}>
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-grow w-full space-y-8">
        
        {/* НОВИНИ */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveNews} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-900">{editingNewsId ? 'Редагувати новину' : 'Додати новину'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Заголовок" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                <input type="text" placeholder="Дата (напр. 14 жовтня 2026)" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                <input type="text" placeholder="Категорія" value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600">Зображення новини з галереї</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setNewsImage)} className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer" />
                </div>
              </div>

              {newsImage && (
                <div className="w-24 h-24 rounded-xl border overflow-hidden bg-stone-100 p-1">
                  <img src={newsImage} alt="Попередній перегляд" className="w-full h-full object-contain" />
                </div>
              )}

              <textarea placeholder="Короткий опис" value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} rows={2} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm"></textarea>
              <textarea placeholder="Повний текст" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={4} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm"></textarea>
              
              <div className="flex space-x-3">
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer flex items-center space-x-2">
                  <Plus className="w-4 h-4" /><span>{editingNewsId ? 'Зберегти зміни' : 'Опублікувати'}</span>
                </button>
                {editingNewsId && (
                  <button type="button" onClick={() => { setEditingNewsId(null); setNewsTitle(''); setNewsDate(''); setNewsCategory(''); setNewsSummary(''); setNewsContent(''); setNewsImage(''); }} className="bg-stone-200 text-stone-700 px-4 py-3 rounded-xl text-sm">Скасувати</button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg">Список новин</h3>
              {newsList.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt="" className="w-12 h-12 object-contain rounded-xl bg-stone-100" />
                    <div><span className="text-xs text-amber-800 font-bold">{item.date}</span><h4 className="font-serif font-bold text-sm">{item.title}</h4></div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditNews(item)} className="p-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl transition cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteNews(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* РОЗКЛАД */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveSchedule} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-900">{editingSchId ? 'Редагувати службу' : 'Додати розклад богослужіння'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">День тижня</label>
                  <select value={schDayOfWeek} onChange={(e) => setSchDayOfWeek(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm">
                    {["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">День (число)</label>
                  <input type="number" min="1" max="31" value={schDay} onChange={(e) => setSchDay(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Місяць (1-12)</label>
                  <input type="number" min="1" max="12" value={schMonth} onChange={(e) => setSchMonth(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Рік</label>
                  <input type="number" value={schYear} onChange={(e) => setSchYear(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Час (напр. 09:00)" value={schTime} onChange={(e) => setSchTime(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                <input type="text" placeholder="Назва служби" value={schService} onChange={(e) => setSchService(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                <input type="text" placeholder="Опис" value={schDesc} onChange={(e) => setSchDesc(e.target.value)} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input type="checkbox" id="weeklyCheck" checked={isWeekly} onChange={(e) => setIsWeekly(e.target.checked)} className="w-4 h-4 text-amber-700 rounded border-stone-300 cursor-pointer" />
                <label htmlFor="weeklyCheck" className="text-sm font-medium text-stone-700 cursor-pointer">
                  Повторювати щотижня
                </label>
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer flex items-center space-x-2">
                  <Plus className="w-4 h-4" /><span>{editingSchId ? 'Зберегти зміни' : 'Додати в розклад'}</span>
                </button>
                {editingSchId && (
                  <button type="button" onClick={() => { setEditingSchId(null); setSchTime(''); setSchService(''); setSchDesc(''); setIsWeekly(false); }} className="bg-stone-200 text-stone-700 px-4 py-3 rounded-xl text-sm">Скасувати</button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg">Поточний розклад</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduleList.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-800">{item.dayOfWeek}, {item.day}.{item.month}.{item.year} • {item.time}</span>
                        {item.isWeekly && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Щотижня</span>}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-slate-900">{item.service}</h4>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditSchedule(item)} className="p-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl transition cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ФОТОТЕКА */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <form onSubmit={handleSaveAlbum} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-amber-900">{editingAlbumId ? 'Редагувати альбом' : 'Створити альбом'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Назва альбому" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                <input type="text" placeholder="Підзаголовок" value={albumSubtitle} onChange={(e) => setAlbumSubtitle(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600">Обкладинка альбому з галереї</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAlbumCover)} className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer" />
                </div>

                <input type="text" placeholder="Дата (напр. Вересень 2026)" value={albumDate} onChange={(e) => setAlbumDate(e.target.value)} required className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
              </div>

              {albumCover && (
                <div className="w-24 h-24 rounded-xl border overflow-hidden bg-stone-100 p-1">
                  <img src={albumCover} alt="Обкладинка" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="space-y-3 pt-2 border-t">
                <label className="block text-xs font-bold text-stone-700">Фотографії в альбомі</label>
                {photosList.map((photo, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-xl border">
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoFileChangeInAlbum(e, index)} className="text-xs text-stone-500 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-stone-200 file:font-semibold cursor-pointer" />
                    <input type="text" placeholder="Підпис до фото (необов'язково)" value={photo.title} onChange={(e) => {
                      const updated = [...photosList];
                      updated[index].title = e.target.value;
                      setPhotosList(updated);
                    }} className="flex-grow p-2 bg-white rounded-lg border text-xs" />
                    {photo.url && <span className="text-xs text-green-700 font-bold">Фото завантажено ✓</span>}
                    <button type="button" onClick={() => setPhotosList(photosList.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1">Видалити</button>
                  </div>
                ))}
                <button type="button" onClick={() => setPhotosList([...photosList, { url: '', title: '' }])} className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer">
                  + Додати ще одне фото
                </button>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer">{editingAlbumId ? 'Зберегти альбом' : 'Створити'}</button>
                {editingAlbumId && (
                  <button type="button" onClick={() => { setEditingAlbumId(null); setAlbumTitle(''); setAlbumSubtitle(''); setAlbumCover(''); setAlbumDate(''); setPhotosList([{ url: '', title: '' }]); }} className="bg-stone-200 text-stone-700 px-4 py-3 rounded-xl text-sm">Скасувати</button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg">Список альбомів</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albumsList.map(album => (
                  <div key={album.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm">
                    <div className="flex items-center space-x-3">
                      <img src={album.cover} alt="" className="w-12 h-12 object-contain rounded-xl bg-stone-100" />
                      <div><span className="text-xs text-amber-800 font-bold">{album.date}</span><h4 className="font-serif font-bold text-sm">{album.title}</h4></div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditAlbum(album)} className="p-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl transition cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteAlbum(album.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ІНФОРМАЦІЯ ТА КОНТАКТИ */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveChurchInfo} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-lg text-amber-900">Редагування інформації та контактів</h3>
            
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-stone-800 border-b pb-2">Основні дані Храму</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Назва Храму</label>
                  <input type="text" value={churchTitle} onChange={(e) => setChurchTitle(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Місто</label>
                  <input type="text" value={churchCity} onChange={(e) => setChurchCity(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Адреса</label>
                  <input type="text" value={churchAddress} onChange={(e) => setChurchAddress(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Телефон</label>
                  <input type="text" value={churchPhone} onChange={(e) => setChurchPhone(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Електронна пошта</label>
                  <input type="email" value={churchEmail} onChange={(e) => setChurchEmail(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Настоятель</label>
                  <input type="text" value={churchRector} onChange={(e) => setChurchRector(e.target.value)} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1">Години роботи</label>
                  <input type="text" value={churchHours} onChange={(e) => setChurchHours(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-serif font-bold text-sm text-stone-800 border-b pb-2">Блок «Інформація про Храм»</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Заголовок блоку</label>
                  <input type="text" value={infoTitle} onChange={(e) => setInfoTitle(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Текст опису Храму</label>
                  <textarea value={infoContent} onChange={(e) => setInfoContent(e.target.value)} rows={5} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Фото Храму з галереї</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setInfoImage)} className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer" />
                </div>
                {infoImage && (
                  <div className="w-32 h-24 rounded-xl border overflow-hidden bg-stone-100 p-1">
                    <img src={infoImage} alt="Попередній перегляд" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer">
              Зберегти всі дані Храму
            </button>
          </form>
        )}

      </main>
    </div>
  );
}