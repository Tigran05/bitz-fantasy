/*:
 * @plugindesc Telegram Web App Integration & Fixes
 * @author Antigravity
 *
 * @help
 * This plugin fixes resizing issues and integrates with Telegram Web App.
 * It overrides internal scaling to rely on CSS for fullscreen display.
 */

(function() {
    // Override _centerElement to let CSS handle positioning
    // This prevents the engine from fighting with our 100vw/100vh CSS
    Graphics._centerElement = function(element) {
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.margin = '0';
        element.style.top = '0';
        element.style.left = '0';
        element.style.zIndex = 99; // Ensure it stays on top
    };

    // Override _updateRealScale to prevent crashes and handle CSS scaling
    Graphics._updateRealScale = function() {
        if (this._stretchEnabled) {
            var h = window.innerWidth / this._width;
            var v = window.innerHeight / this._height;
            
            // Avoid division by zero or infinite values
            if (!isFinite(h)) h = 1;
            if (!isFinite(v)) v = 1;

            // Use the smaller scale to fit, or larger to cover?
            // We just calculate it safely.
            this._realScale = Math.min(h, v);
        } else {
            this._realScale = this._scale;
        }
    };
    
    // Safety wrapper for window resize
    var _Graphics_onWindowResize = Graphics._onWindowResize;
    Graphics._onWindowResize = function() {
        try {
            // Ensure width/height are valid before updating
            if (window.innerWidth === 0 || window.innerHeight === 0) return;
            
            _Graphics_onWindowResize.call(this);
        } catch (e) {
            console.warn("TelegramWebApp: Resize error suppressed", e);
        }
    };

    // Global error handler to catch "Script Error" and provide more info if possible
    window.addEventListener('error', function(event) {
        console.error("Global Error:", event.message, "at", event.filename, ":", event.lineno);
        // We could send this to a server or display it on screen for debugging
    });

})();
