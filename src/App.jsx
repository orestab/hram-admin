import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Lock, Plus, Trash2, Calendar, Newspaper, FolderPlus, Image as ImageIcon, LogOut, X } from 'lucide-react';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('news');

  const [newsList, setNewsList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [albumsList, setAlbumsList] = useState([]);

  // Поля новин
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDate, setNewsDate] = useState('');
  const [newsCategory, setNewsCategory] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImage, setNewsImage] = useState('');

  // Поля розкладу
  const [schDay, setSchDay] = useState('');
  const [schTime, setSchTime] = useState('');
  const [schService, setSchService] = useState('');
  const [schDesc, setSchDesc] = useState('');

  // Поля альбому фототеки
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumSubtitle, setAlbumSubtitle] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  
  // Динамічний список фотографій
  const [photosList, setPhotosList] = useState([
    { url: '', title: '' }
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const newsSnap = await getDocs(collection(db, "news"));
      setNewsList(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const schSnap = await getDocs(collection(db, "schedule"));
      setScheduleList(schSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const albumsSnap = await getDocs(collection(db, "photoAlbums"));
      setAlbumsList(albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Невірний пароль!");
    }
  };

  // Робота зі списком фото у фототеці
  const handlePhotoChange = (index, field, value) => {
    const updated = [...photosList];
    updated[index][field] = value;
    setPhotosList(updated);
  };

  const handleAddPhotoField = () => {
    setPhotosList([...photosList, { url: '', title: '' }]);
  };

  const handleRemovePhotoField = (index) => {
    if (photosList.length === 1) {
      alert("В альбомі має бути щонайменше одна світлина!");
      return;
    }
    const updated = photosList.filter((_, i) => i !== index);
    setPhotosList(updated);
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "news"), {
        title: newsTitle,
        date: newsDate,
        category: newsCategory,
        summary: newsSummary,
        content: newsContent,
        image: newsImage
      });
      setNewsTitle(''); setNewsDate(''); setNewsCategory(''); setNewsSummary(''); setNewsContent(''); setNewsImage('');
      loadData();
      alert("Новину успішно додано!");
    } catch (err) {
      alert("Помилка: " + err.message);
    }
  };

  const handleDeleteNews = async (id) => {
    if (confirm("Видалити цю новину?")) {
      await deleteDoc(doc(db, "news", id));
      loadData();
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "schedule"), {
        day: schDay,
        time: schTime,
        service: schService,
        desc: schDesc
      });
      setSchDay(''); setSchTime(''); setSchService(''); setSchDesc('');
      loadData();
      alert("Розклад успішно додано!");
    } catch (err) {
      alert("Помилка: " + err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (confirm("Видалити запис розкладу?")) {
      await deleteDoc(doc(db, "schedule", id));
      loadData();
    }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    try {
      // Валідація та підготовка фотографій
      const formattedPhotos = photosList
        .filter(item => item.url.trim() !== '')
        .map((item, idx) => ({
          id: 'p-' + Date.now() + '-' + idx,
          url: item.url.trim(),
          title: item.title.trim() || albumTitle
        }));

      if (formattedPhotos.length === 0) {
        alert("Будь ласка, додайте хоча б одне посилання на фотографію!");
        return;
      }

      await addDoc(collection(db, "photoAlbums"), {
        title: albumTitle,
        subtitle: albumSubtitle,
        cover: albumCover,
        date: albumDate,
        photos: formattedPhotos
      });

      setAlbumTitle(''); 
      setAlbumSubtitle(''); 
      setAlbumCover(''); 
      setAlbumDate(''); 
      setPhotosList([{ url: '', title: '' }]);
      
      loadData();
      alert("Альбом фототеки успішно додано!");
    } catch (err) {
      alert("Помилка: " + err.message);
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (confirm("Видалити цей фотоальбом?")) {
      await deleteDoc(doc(db, "photoAlbums", id));
      loadData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-stone-800 max-w-sm w-full space-y-5 text-white shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/30 text-amber-300 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold">Адмін-панель Храму</h1>
            <p className="text-xs text-stone-400">Введіть пароль для керування сайтом</p>
          </div>
          <input 
            type="password" 
            placeholder="Пароль (1234)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-stone-700 text-sm focus:outline-none focus:border-amber-500 text-center tracking-widest"
          />
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 font-semibold py-3 rounded-xl transition text-sm cursor-pointer">
            Увійти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950 text-white border-b border-stone-800 px-4 sm:px-6 py-3.5 flex justify-between items-center">
        <h1 className="font-serif font-bold text-sm sm:text-lg text-amber-200">Панель управління</h1>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="flex items-center space-x-1.5 text-xs text-stone-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-stone-800 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Вийти</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-3 sm:px-6 flex space-x-2 sm:space-x-4 shadow-sm overflow-x-auto">
        {[
          { id: 'news', label: 'Новини', icon: Newspaper },
          { id: 'schedule', label: 'Розклад', icon: Calendar },
          { id: 'gallery', label: 'Фототека', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? 'border-amber-600 text-amber-800 font-bold' : 'border-transparent text-stone-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 flex-grow w-full space-y-6 sm:space-y-8">
        
        {/* НОВИНИ */}
        {activeTab === 'news' && (
          <div className="space-y-6 sm:space-y-8">
            <form onSubmit={handleAddNews} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-900">Додати нову новину</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input type="text" placeholder="Заголовок новини" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Дата (напр. 14 жовтня 2026)" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Категорія (напр. Подія)" value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)} className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="URL зображення новини" value={newsImage} onChange={(e) => setNewsImage(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
              </div>
              <textarea placeholder="Короткий опис новини" value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} rows={2} required className="w-full p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm"></textarea>
              <textarea placeholder="Повний текст новини" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={4} required className="w-full p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm"></textarea>
              <button type="submit" className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer">
                <Plus className="w-4 h-4" /> <span>Опублікувати новину</span>
              </button>
            </form>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg">Опубліковані новини ({newsList.length})</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {newsList.map(item => (
                  <div key={item.id} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm gap-3">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                      <img src={item.image} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs text-amber-800 font-bold">{item.date}</span>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">{item.title}</h4>
                        <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-1">{item.summary}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteNews(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* РОЗКЛАД */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 sm:space-y-8">
            <form onSubmit={handleAddSchedule} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-900">Додати подію до розкладу</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input type="text" placeholder="День (напр. Неділя)" value={schDay} onChange={(e) => setSchDay(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Час (напр. 09:00)" value={schTime} onChange={(e) => setSchTime(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Назва службы" value={schService} onChange={(e) => setSchService(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Опис / примітка" value={schDesc} onChange={(e) => setSchDesc(e.target.value)} className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer">
                <Plus className="w-4 h-4" /> <span>Додати в розклад</span>
              </button>
            </form>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg">Поточний розклад</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {scheduleList.map(item => (
                  <div key={item.id} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-amber-800">{item.day} • {item.time}</span>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900">{item.service}</h4>
                      <p className="text-[11px] sm:text-xs text-stone-600">{item.desc}</p>
                    </div>
                    <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ФОТОТЕКА */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 sm:space-y-8">
            <form onSubmit={handleAddAlbum} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-4 sm:space-y-5">
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-900">Створити новий фотоальбом</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input type="text" placeholder="Назва альбому (напр. Престольне свято)" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Підзаголовок / опис" value={albumSubtitle} onChange={(e) => setAlbumSubtitle(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="URL обкладинки альбому" value={albumCover} onChange={(e) => setAlbumCover(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
                <input type="text" placeholder="Дата або період (напр. Осінь 2026)" value={albumDate} onChange={(e) => setAlbumDate(e.target.value)} required className="p-2.5 sm:p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm" />
              </div>

              {/* Динамічний блок додавання світлин */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-serif font-bold text-slate-800">
                    Світлини альбому ({photosList.length})
                  </label>
                  <button 
                    type="button" 
                    onClick={handleAddPhotoField}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Додати ще фото</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {photosList.map((photo, index) => (
                    <div key={index} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Світлина #{index + 1}</span>
                        {photosList.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemovePhotoField(index)}
                            className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <input 
                          type="text" 
                          placeholder="URL фотографії" 
                          value={photo.url} 
                          onChange={(e) => handlePhotoChange(index, 'url', e.target.value)}
                          required
                          className="sm:col-span-7 p-2 bg-white rounded-lg border border-stone-200 text-xs"
                        />
                        <input 
                          type="text" 
                          placeholder="Підпис до фото (необов'язково)" 
                          value={photo.title} 
                          onChange={(e) => handlePhotoChange(index, 'title', e.target.value)}
                          className="sm:col-span-5 p-2 bg-white rounded-lg border border-stone-200 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer">
                <FolderPlus className="w-4 h-4" /> <span>Створити альбом</span>
              </button>
            </form>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-serif font-bold text-base sm:text-lg">Альбоми у фототеці ({albumsList.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {albumsList.map(album => (
                  <div key={album.id} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm gap-3">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                      <img src={album.cover} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs text-amber-800 font-bold">{album.date}</span>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">{album.title}</h4>
                        <p className="text-[11px] sm:text-xs text-stone-600">{album.photos?.length || 0} світлин у галереї</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAlbum(album.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition cursor-pointer flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}