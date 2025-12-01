/*:
 * @plugindesc Telegram Web App Integration & Fixes
 * @author Bitz Fantasy
 *
 * @help
 * This plugin integrates Telegram Web App features and fixes common issues.
 * 
 * Features:
 * - Automatically expands the app to full screen.
 * - Disables vertical swipes to prevent accidental closing.
 * - Sets the header and background colors.
 * - Exposes the Telegram Web App object as $gameTemp.tg
 */

(function () {
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.call(this);
        this.initTelegramWebApp();
    };

    Scene_Boot.prototype.initTelegramWebApp = function () {
        if (window.Telegram && window.Telegram.WebApp) {
            var tg = window.Telegram.WebApp;
            $gameTemp.tg = tg;

            // Expand to full screen
            tg.expand();

            // Handle rotation/resize events from Telegram
            tg.onEvent('viewportChanged', function () {
                if (Graphics && Graphics._onWindowResize) {
                    Graphics._onWindowResize();
                }
            });

            // Disable vertical swipes
            if (tg.disableVerticalSwipes) {
                tg.disableVerticalSwipes();
            }

            // Set colors
            if (tg.setHeaderColor) {
                tg.setHeaderColor('#000000');
            }
            if (tg.setBackgroundColor) {
                tg.setBackgroundColor('#000000');
            }

            // Notify Telegram that the app is ready
            tg.ready();

            console.log("Telegram Web App initialized");
        }
    };
})();
