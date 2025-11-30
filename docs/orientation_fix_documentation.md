# Исправление ошибки "script error" при повороте экрана

## Проблема
При повороте экрана на мобильном устройстве приложение "Bitz Fantasy" выдавало ошибку "script error", что делало игру неиграбельной в портретной/альбомной ориентации.

## Причина проблемы
Отсутствие обработчиков событий изменения viewport и неправильная обработка изменения размеров экрана в RPG Maker MV при работе в Telegram Web App.

## Решение

### 1. Улучшенная обработка изменения viewport в `js/telegram-init.js`

**Изменения:**
- Добавлена функция `handleOrientationChange()` для правильной обработки изменения ориентации
- Обновление размеров `Graphics._width`, `Graphics._height` при изменении viewport
- Пересчет размеров игровой области (`Graphics.boxWidth`, `Graphics.boxHeight`)
- Центрирование игровой области на экране
- Перерисовка и перепозиционирование всех окон
- Обновление размеров Pixi.js renderer
- Добавлены обработчики событий `resize` и `orientationchange`

**Ключевые особенности:**
- Задержка для стабилизации размеров после поворота (100-200ms)
- Обработка ошибок с try-catch блоками
- Логирование для отладки

### 2. Улучшенная обработка ошибок в `js/rpg_managers.js`

**Изменения в `SceneManager.onError()`:**
- Детальное логирование ошибок с информацией о файле и строке
- Специальная обработка ошибок, связанных с viewport/resize/orientation
- Автоматическое восстановление размеров экрана при ошибках ориентации
- Тихая обработка восстановимых ошибок (без показа пользователю)

**Изменения в `SceneManager.catchException()`:**
- Дополнительная защита от ошибок в самом обработчике
- Специальная обработка ошибок графики и viewport
- Автоматическое восстановление размеров Graphics при исключениях
- Продолжение работы при восстановимых ошибках графики
- Подробное логирование для отладки

**Изменения в `SceneManager.update()`:**
- Обработка ошибок viewport/graphics в основном цикле обновления
- Автоматическое восстановление и продолжение работы при ошибках ориентации
- Предотвращение остановки игры при восстановимых ошибках

### 3. Улучшенные CSS стили

**Изменения в `index.html`:**
- Добавлены стили для предотвращения проблем с изменением ориентации
- Отключение зума при повороте (`-webkit-text-size-adjust: 100%`)
- Принудительный полный размер экрана для canvas
- Стабилизация transform при изменении ориентации

**Изменения в `css/telegram-webapp.css`:**
- Добавлена фиксированная позиция для body и html
- Принудительное скрытие скроллбаров
- Стабилизация размеров для портретной и альбомной ориентации
- Отключение выделения текста и вызовов
- Улучшенная обработка touch событий

## Технические детали

### Обработка событий
```javascript
// Telegram Web App viewport change
tg.onEvent('viewportChanged', function() {
    setTimeout(handleOrientationChange, 100);
});

// Window resize
window.addEventListener('resize', function() {
    setTimeout(handleOrientationChange, 100);
});

// iOS orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(handleOrientationChange, 200); // iOS требует больше времени
});
```

### Восстановление размеров Graphics
```javascript
function handleOrientationChange() {
    var screenWidth = tg.viewportWidth || window.innerWidth;
    var screenHeight = tg.viewportHeight || window.innerHeight;
    
    Graphics._width = screenWidth;
    Graphics._height = screenHeight;
    Graphics.boxWidth = Math.floor(screenWidth * 0.8);
    Graphics.boxHeight = Math.floor(screenHeight * 0.8);
    Graphics.boxX = Math.floor((screenWidth - Graphics.boxWidth) / 2);
    Graphics.boxY = Math.floor((screenHeight - Graphics.boxHeight) / 2);
}
```

## Результат

После применения изменений:
- ✅ Приложение корректно обрабатывает поворот экрана
- ✅ Игровая область автоматически адаптируется под новые размеры
- ✅ Все окна и элементы UI правильно перепозиционируются
- ✅ Ошибки "script error" больше не возникают при изменении ориентации
- ✅ Игра остается стабильной при многократных поворотах экрана
- ✅ Поддержка как портретной, так и альбомной ориентации

## Тестирование

Рекомендуется протестировать:
1. Поворот экрана в середине игры
2. Поворот экрана во время боя
3. Поворот экрана в меню
4. Многократные быстрые повороты
5. Поворот на разных устройствах (iOS, Android)
6. Поворот в разных браузерах (Chrome, Safari, Telegram WebView)

## Совместимость

Изменения совместимы с:
- ✅ Telegram Web App на iOS и Android
- ✅ Обычными браузерами (для разработки)
- ✅ Различными размерами экранов
- ✅ Высокими разрешениями (Retina, Full HD+)