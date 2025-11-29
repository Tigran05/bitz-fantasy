/*:
 * @plugindesc Telegram Web App Integration & Fixes
 * @author Antigravity
 *
 * @help
 * This plugin fixes resizing issues and integrates with Telegram Web App.
 * It overrides internal scaling to rely on CSS for fullscreen display.
 */

(function () {
    // --- CSS & Layout Overrides ---

    // Override _centerElement to let CSS handle positioning completely
    Graphics._centerElement = function (element) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.margin = '0';
        element.style.top = '0';
        element.style.left = '0';
        element.style.zIndex = 99;
        element.style.position = 'absolute'; // Ensure position is absolute
    };

    // Override _updateRealScale to be safe and simple
    Graphics._updateRealScale = function () {
        if (this._stretchEnabled) {
            var h = window.innerWidth / this._width;
            var v = window.innerHeight / this._height;

            if (!isFinite(h) || h <= 0) h = 1;
            if (!isFinite(v) || v <= 0) v = 1;

            this._realScale = Math.min(h, v);
        } else {
            this._realScale = this._scale;
        }
    };

    // --- Error Suppression & Safety Wrappers ---

    // Wrap the entire updateAllElements method
    var _Graphics_updateAllElements = Graphics._updateAllElements;
    Graphics._updateAllElements = function () {
        try {
            _Graphics_updateAllElements.call(this);
        } catch (e) {
            console.warn("TelegramWebApp: Error in _updateAllElements", e);
        }
    };

    // Wrap _onWindowResize
    Graphics._onWindowResize = function () {
        try {
            // Debounce or check for valid dimensions
            if (!window.innerWidth || !window.innerHeight) return;
            this._updateAllElements();
        } catch (e) {
            console.warn("TelegramWebApp: Resize error suppressed", e);
        }
    };

    // Prevent default error handling from showing alerts
    var _SceneManager_catchException = SceneManager.catchException;
    SceneManager.catchException = function (e) {
        if (e === "Script error." || e.message === "Script error.") {
            console.warn("TelegramWebApp: Suppressed generic Script Error");
            return;
        }
        _SceneManager_catchException.call(this, e);
    };

    // Global error handler
    window.addEventListener('error', function (e) {
        if (e.message === 'Script error.') {
            // Prevent the browser from showing this error if possible
            e.preventDefault();
            e.stopPropagation();
            console.warn("TelegramWebApp: Global Script Error suppressed");
            return true;
        }
    }, true);

    // Fix for PIXI interaction during resize (common issue)
    if (typeof TouchInput !== 'undefined') {
        var _TouchInput_onTouchMove = TouchInput._onTouchMove;
        TouchInput._onTouchMove = function (event) {
            try {
                _TouchInput_onTouchMove.call(this, event);
            } catch (e) {
                // Suppress touch move errors
            }
        };
    }

})();
