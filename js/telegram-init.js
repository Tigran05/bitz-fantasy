// Telegram Web App Integration Script
// Инициализация Telegram Web App для RPG Maker MV

(function() {
    'use strict';
    
    // Проверяем, что скрипт запущен в Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Расширяем приложение на весь экран
        tg.expand();
        
        // Включаем режим закрепления (предотвращает случайное закрытие)
        tg.enableClosingConfirmation();
        
        // Устанавливаем цвет заголовка под тему Telegram
        tg.setHeaderColor('bg_color');
        
        // Устанавливаем цвет фона под тему Telegram
        tg.setBackgroundColor('bg_color');
        
        // Готовим приложение к показу
        tg.ready();
        
        console.log('Telegram Web App initialized');
        console.log('User ID:', tg.initDataUnsafe?.user?.id);
        console.log('Platform:', tg.platform);
        
        // Облачное хранилище для сохранений
        window.TelegramCloudStorage = {
            // Сохранить данные в облако Telegram
            save: function(key, value, callback) {
                if (tg.CloudStorage) {
                    const dataStr = typeof value === 'string' ? value : JSON.stringify(value);
                    tg.CloudStorage.setItem(key, dataStr, function(error, success) {
                        if (error) {
                            console.error('Cloud save error:', error);
                            if (callback) callback(false, error);
                        } else {
                            console.log('Cloud save success:', key);
                            if (callback) callback(true);
                        }
                    });
                } else {
                    console.warn('Cloud Storage not available');
                    if (callback) callback(false, 'Cloud Storage not available');
                }
            },
            
            // Загрузить данные из облака Telegram
            load: function(key, callback) {
                if (tg.CloudStorage) {
                    tg.CloudStorage.getItem(key, function(error, value) {
                        if (error) {
                            console.error('Cloud load error:', error);
                            if (callback) callback(null, error);
                        } else {
                            console.log('Cloud load success:', key);
                            try {
                                const parsed = JSON.parse(value);
                                if (callback) callback(parsed);
                            } catch (e) {
                                if (callback) callback(value);
                            }
                        }
                    });
                } else {
                    console.warn('Cloud Storage not available');
                    if (callback) callback(null, 'Cloud Storage not available');
                }
            },
            
            // Удалить данные из облака
            remove: function(key, callback) {
                if (tg.CloudStorage) {
                    tg.CloudStorage.removeItem(key, function(error, success) {
                        if (error) {
                            console.error('Cloud remove error:', error);
                            if (callback) callback(false, error);
                        } else {
                            console.log('Cloud remove success:', key);
                            if (callback) callback(true);
                        }
                    });
                } else {
                    console.warn('Cloud Storage not available');
                    if (callback) callback(false, 'Cloud Storage not available');
                }
            },
            
            // Получить все ключи
            getKeys: function(callback) {
                if (tg.CloudStorage) {
                    tg.CloudStorage.getKeys(function(error, keys) {
                        if (error) {
                            console.error('Cloud getKeys error:', error);
                            if (callback) callback([], error);
                        } else {
                            console.log('Cloud keys:', keys);
                            if (callback) callback(keys || []);
                        }
                    });
                } else {
                    console.warn('Cloud Storage not available');
                    if (callback) callback([], 'Cloud Storage not available');
                }
            }
        };
        
        // Получаем информацию о пользователе Telegram
        window.TelegramUser = {
            id: tg.initDataUnsafe?.user?.id || null,
            firstName: tg.initDataUnsafe?.user?.first_name || '',
            lastName: tg.initDataUnsafe?.user?.last_name || '',
            username: tg.initDataUnsafe?.user?.username || '',
            languageCode: tg.initDataUnsafe?.user?.language_code || 'en',
            isPremium: tg.initDataUnsafe?.user?.is_premium || false
        };
        
        // Обработчик события изменения viewport
        tg.onEvent('viewportChanged', function() {
            console.log('Viewport changed:', tg.viewportHeight, tg.viewportStableHeight);
            
            // Задержка для стабилизации размеров после поворота
            setTimeout(function() {
                handleOrientationChange();
            }, 100);
        });
        
        // Функция обработки изменения ориентации
        function handleOrientationChange() {
            try {
                // Обновляем размеры Graphics для нового viewport
                if (typeof Graphics !== 'undefined') {
                    // Получаем новые размеры экрана
                    var screenWidth = tg.viewportWidth || window.innerWidth;
                    var screenHeight = tg.viewportHeight || window.innerHeight;
                    
                    // Обновляем размеры экрана
                    Graphics._width = screenWidth;
                    Graphics._height = screenHeight;
                    
                    // Обновляем размеры box (игровая область)
                    Graphics.boxWidth = Math.floor(screenWidth * 0.8);
                    Graphics.boxHeight = Math.floor(screenHeight * 0.8);
                    
                    // Центрируем игровую область
                    Graphics.boxX = Math.floor((screenWidth - Graphics.boxWidth) / 2);
                    Graphics.boxY = Math.floor((screenHeight - Graphics.boxHeight) / 2);
                    
                    // Перерисовываем все окна
                    if (typeof SceneManager !== 'undefined' && SceneManager._scene) {
                        SceneManager._scene._windowLayer.children.forEach(function(window) {
                            if (typeof window.move === 'function') {
                                // Перепозиционируем окна
                                var newX = (Graphics.boxWidth - window.width) / 2;
                                var newY = (Graphics.boxHeight - window.height) / 2;
                                window.move(newX, newY, window.width, window.height);
                            }
                        });
                    }
                    
                    // Обновляем размеры renderer если есть
                    if (Graphics._renderer && typeof Graphics._renderer.resize === 'function') {
                        Graphics._renderer.resize(screenWidth, screenHeight);
                    }
                    
                    console.log('Screen resized to:', screenWidth, 'x', screenHeight);
                    console.log('Game box:', Graphics.boxWidth, 'x', Graphics.boxHeight);
                }
            } catch (error) {
                console.error('Error handling orientation change:', error);
            }
        }

        // Также добавляем стандартный обработчик изменения размера окна
        window.addEventListener('resize', function() {
            setTimeout(function() {
                handleOrientationChange();
            }, 100);
        });

        // Обработчик изменения ориентации для iOS
        window.addEventListener('orientationchange', function() {
            setTimeout(function() {
                handleOrientationChange();
            }, 200); // iOS требует больше времени для стабилизации
        });
        
        // Уведомляем пользователя о готовности
        tg.showPopup({
            title: 'Bitz Fantasy',
            message: 'Игра загружена! Приятной игры!',
            buttons: [{type: 'ok'}]
        });
        
    } else {
        console.warn('Not running in Telegram Web App');
        // Если не в Telegram, показываем предупреждение
        console.log('This game is optimized for Telegram Web App');
    }
})();
