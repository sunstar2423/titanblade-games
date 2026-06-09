document.addEventListener('DOMContentLoaded', function () {
    // Game card navigation
    document.querySelectorAll('.game-card[data-href]').forEach(function (card) {
        card.addEventListener('click', function () {
            window.location.href = card.dataset.href;
        });
    });

    // Fallback image for missing game previews
    document.querySelectorAll('img[data-fallback-text]').forEach(function (img) {
        img.addEventListener('error', function () {
            var text = encodeURIComponent(img.dataset.fallbackText || '');
            img.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2230%22 fill=%22white%22%3E' + text + '%3C/text%3E%3C/svg%3E';
        });
    });
});
