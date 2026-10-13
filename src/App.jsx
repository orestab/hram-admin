import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { 
  Plus, Edit, Trash2, Calendar, Clock, Newspaper, Save, X, 
  Menu, Shield, Lock, LogOut, Image as ImageIcon, Search, CheckCircle, AlertCircle
} from 'lucide-react';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('news'); // 'news' або 'schedule'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Новини
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Новина',
    date: '',
    summary: '',
    content: '',
    image: ''
  });

  // Розклад
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    day: '',
    time: '',
    service: '',
    desc: ''
  });

  const [statusMessage, setStatusMessage] = useState('');

  // Перевірка авторизації при завантаженні
  useEffect(() => {
    const savedAuth = localStorage.getItem('hram_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Завантаження даних із Firestore
  useEffect(() => {
    if (isAuthenticated) {
      fetchNews();
      fetchSchedule();
    }
  }, [isAuthenticated]);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '1234') { // Змініть пароль на власний за потреби
      setIsAuthenticated(true);
      localStorage.setItem('hram_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Невірний пароль доступу!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hram_admin_auth');
  };

  // --- ЛОГІКА НОВИН ---
  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const snap = await getDocs(collection(db, 'news'));
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Помилка завантаження новин:", e);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleOpenNewsModal = (item = null) => {
    if (item) {
      setEditingNewsId(item.id);
      setNewsForm({
        title: item.title || '',
        category: item.category || 'Новина',
        date: item.date || new Date().toISOString().split('T')[0],
        summary: item.summary || '',
        content: item.content || '',
        image: item.image || ''
      });
    } else {
      setEditingNewsId(null);
      setNewsForm({
        title: '',
        category: 'Новина',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        content: '',
        image: ''
      });
    }
    setNewsModalOpen(true);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      if (editingNewsId) {
        await updateDoc(doc(db, 'news', editingNewsId), newsForm);
        showStatus('Новину успішно оновлено!');
      } else {
        await addDoc(collection(db, 'news'), newsForm);
        showStatus('Нову новину опубліковано!');
      }
      setNewsModalOpen(false);
      fetchNews();
    } catch (e) {
      console.error("Помилка збереження новини:", e);
      alert('Помилка при збереженні!');
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Ви дійсно бажаєте видалити цю новину?')) {
      try {
        await deleteDoc(doc(db, 'news', id));
        showStatus('Новину видалено.');
        fetchNews();
      } catch (e) {
        console.error("Помилка видалення новини:", e);
      }
    }
  };

  // --- ЛОГІКА РОЗКЛАДУ ---
  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const snap = await getDocs(collection(db, 'schedule'));
      setSchedule(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Помилка завантаження розкладу:", e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleOpenScheduleModal = (item = null) => {
    if (item) {
      setEditingScheduleId(item.id);
      setScheduleForm({
        day: item.day || '',
        time: item.time || '',
        service: item.service || '',
        desc: item.desc || ''
      });
    } else {
      setEditingScheduleId(null);
      setScheduleForm({
        day: '',
        time: '09:00',
        service: '',
        desc: ''
      });
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingScheduleId) {
        await updateDoc(doc(db, 'schedule', editingScheduleId), scheduleForm);
        showStatus('Богослужіння оновлено!');
      } else {
        await addDoc(collection(db, 'schedule'), scheduleForm);
        showStatus('Нове богослужіння додано!');
      }
      setScheduleModalOpen(false);
      fetchSchedule();
    } catch (e) {
      console.error("Помилка збереження розкладу:", e);
      alert('Помилка при збереженні!');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Вилучити цей запис із розкладу?')) {
      try {
        await deleteDoc(doc(db, 'schedule', id));
        showStatus('Запис вилучено з розкладу.');
        fetchSchedule();
      } catch (e) {
        console.error("Помилка видалення розкладу:", e);
      }
    }
  };

  // Екран входу
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Адмін-панель</h1>
            <p className="text-xs text-slate-500">Храм Святої Софії (м. Луцьк)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Пароль доступу</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password"
                  placeholder="Введіть пароль"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-semibold text-center">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer text-sm"
            >
              Увійти в систему
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">

      {/* Мобільна шапка */}
      <header className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <Shield className="w-6 h-6 text-amber-400" />
          <span className="font-serif font-bold text-base">Софія Адмін</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-600"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Бічне меню (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          <div className="hidden md:flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-base leading-tight">Софія Адмін</h2>
              <p className="text-[11px] text-amber-400 font-medium">Панель керування</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab('news'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-amber-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-5 h-5" />
              <span>Новини та Нотатки</span>
            </button>

            <button
              onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-amber-600 text-white font-bold shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Розклад служб</span>
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-red-400 hover:text-red-300 text-xs font-bold transition cursor-pointer mt-6 md:mt-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Вийти з системи</span>
        </button>
      </aside>

      {/* Затемнення для мобільного меню */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Основна область контенту */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-sm animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* --- ВКЛАДКА: НОВИНИ --- */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Управління новинами</h1>
                <p className="text-xs text-slate-500 mt-0.5">Публікація подій та оголошень на головному сайті</p>
              </div>

              <button
                onClick={() => handleOpenNewsModal()}
                className="inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Опублікувати новину</span>
              </button>
            </div>

            {loadingNews ? (
              <div className="text-center py-12 text-xs sm:text-sm text-slate-500">Завантаження новин з бази Firestore...</div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {news.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="admin-news-img-wrapper">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="admin-news-img" />
                        ) : (
                          <div className="text-slate-400 text-xs flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                            <span>Без фото</span>
                          </div>
                        )}
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {item.category || 'Новина'}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                        <h3 className="font-serif font-bold text-slate-900 text-sm line-clamp-2">{item.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.summary}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenNewsModal(item)}
                        className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        title="Редагувати"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm text-slate-500">
                Новини відсутні. Натисніть «Опублікувати новину», щоб додати першу.
              </div>
            )}
          </div>
        )}

        {/* --- ВКЛАДКА: РОЗКЛАД --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Розклад богослужінь</h1>
                <p className="text-xs text-slate-500 mt-0.5">Редагуйте дні, час та назви служб</p>
              </div>

              <button
                onClick={() => handleOpenScheduleModal()}
                className="inline-flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Додати службу</span>
              </button>
            </div>

            {loadingSchedule ? (
              <div className="text-center py-12 text-xs sm:text-sm text-slate-500">Завантаження розкладу...</div>
            ) : schedule.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-900 text-xs sm:text-sm">{item.day}</span>
                        <span className="inline-flex items-center text-xs font-bold text-slate-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                          {item.time}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">{item.service}</h4>
                      {item.desc && <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenScheduleModal(item)}
                        className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs sm:text-sm text-slate-500">
                Розклад порожній. Натисніть «Додати службу».
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- МОДАЛЬНЕ ВІКНО НОВИН (АДАПТИВНЕ) --- */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <h3 className="font-serif font-bold text-base sm:text-lg">
                {editingNewsId ? 'Редагувати новину' : 'Нова новина'}
              </h3>
              <button 
                onClick={() => setNewsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-grow text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Заголовок *</label>
                  <input 
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="Заголовок новини"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Категорія</label>
                  <input 
                    type="text"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="Новина / Подія / Оголошення"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Дата публікації</label>
                  <input 
                    type="text"
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="Наприклад: 14 жовтня 2026"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL фотографії</label>
                  <input 
                    type="url"
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Короткий опис (Summary) *</label>
                <textarea 
                  required
                  rows={2}
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                  placeholder="2-3 речення для прев'ю на головній сторінці"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Повний текст новини *</label>
                <textarea 
                  required
                  rows={6}
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                  placeholder="Детальний опис події чи новини..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white transition shadow cursor-pointer"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНЕ ВІКНО РОЗКЛАДУ (АДАПТИВНЕ) --- */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto">
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-serif font-bold text-base sm:text-lg">
                {editingScheduleId ? 'Редагувати службу' : 'Нова служба'}
              </h3>
              <button 
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">День *</label>
                  <input 
                    type="text"
                    required
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="Наприклад: Неділя"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Час *</label>
                  <input 
                    type="text"
                    required
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                    placeholder="09:00"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Назва богослужіння *</label>
                <input 
                  type="text"
                  required
                  value={scheduleForm.service}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                  placeholder="Божественна Літургія"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Примітка / Опис</label>
                <input 
                  type="text"
                  value={scheduleForm.desc}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none"
                  placeholder="Сповідь о 08:30, Причастя"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white transition shadow cursor-pointer"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}