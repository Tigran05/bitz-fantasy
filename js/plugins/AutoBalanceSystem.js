//=============================================================================
// Auto Balance System для RPG Maker MV
// Автоматический подбор врагов в зависимости от силы партии
//=============================================================================

(function() {
    
    // Функция для расчета среднего уровня партии
    function getAveragePartyLevel() {
        var party = $gameParty.allMembers();
        if (party.length === 0) return 1;
        
        var totalLevel = 0;
        for (var i = 0; i < party.length; i++) {
            totalLevel += party[i].level;
        }
        return Math.floor(totalLevel / party.length);
    }
    
    // Функция для определения сложности врагов на основе уровня
    function getEnemyDifficultyByLevel(level) {
        if (level <= 5) {
            return { min: 1, max: 3 }; // Враги 1-3 (очень слабые)
        } else if (level <= 10) {
            return { min: 4, max: 6 }; // Враги 4-6 (слабые)
        } else if (level <= 15) {
            return { min: 7, max: 9 }; // Враги 7-9 (средние)
        } else if (level <= 20) {
            return { min: 10, max: 12 }; // Враги 10-12 (сильные)
        } else if (level <= 25) {
            return { min: 13, max: 15 }; // Враги 13-15 (очень сильные)
        } else if (level <= 30) {
            return { min: 16, max: 18 }; // Враги 16-18 (элитные)
        } else {
            return { min: 19, max: 21 }; // Враги 19-21 (финальные)
        }
    }
    
    // Функция для получения случайного врага в диапазоне сложности
    function getRandomEnemy(minId, maxId) {
        return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    }
    
    // Функция для создания автобалансной группы врагов
    function createAutoBalancedEncounter() {
        var averageLevel = getAveragePartyLevel();
        var difficulty = getEnemyDifficultyByLevel(averageLevel);
        
        // Создаем группу из 2-4 врагов
        var enemyCount = Math.floor(Math.random() * 3) + 2; // 2-4 врага
        var enemies = [];
        
        for (var i = 0; i < enemyCount; i++) {
            enemies.push(getRandomEnemy(difficulty.min, difficulty.max));
        }
        
        // Добавляем шанс на босса (5% для уровней 15+)
        if (averageLevel >= 15 && Math.random() < 0.05) {
            var bossId = 22 + Math.floor(Math.random() * 6); // Боссы 22-27
            enemies.push(bossId);
        }
        
        return enemies;
    }
    
    // Функция для создания автобалансной группы в событии
    function createAutoBalancedTroop() {
        var enemies = createAutoBalancedEncounter();
        
        // Создаем временную группу врагов
        var troop = new Game_Troop();
        
        // Добавляем врагов в группу
        for (var i = 0; i < enemies.length; i++) {
            var enemy = new Game_Enemy(enemies[i], 0, 0);
            troop._enemies.push(enemy);
        }
        
        return troop;
    }
    
    // Экспортируем функции для использования в событиях
    window.AutoBalanceSystem = {
        getAveragePartyLevel: getAveragePartyLevel,
        createAutoBalancedEncounter: createAutoBalancedEncounter,
        createAutoBalancedTroop: createAutoBalancedTroop,
        getEnemyDifficultyByLevel: getEnemyDifficultyByLevel
    };
    
})();