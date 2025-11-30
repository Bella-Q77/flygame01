// 页面性能优化和额外交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 性能优化：图片懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // 回退方案：简单的延迟加载
        setTimeout(() => {
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }, 1000);
    }
    
    // 添加页面加载动画
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a0a;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: opacity 0.5s ease, visibility 0.5s ease;
    `;
    
    const loadingLogo = document.createElement('div');
    loadingLogo.className = 'loading-logo';
    loadingLogo.style.cssText = `
        width: 80px;
        height: 80px;
        border: 4px solid rgba(78, 205, 196, 0.3);
        border-top: 4px solid #4ecdc4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    `;
    
    const loadingText = document.createElement('p');
    loadingText.textContent = '加载中...';
    loadingText.style.cssText = `
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        font-size: 18px;
    `;
    
    loadingScreen.appendChild(loadingLogo);
    loadingScreen.appendChild(loadingText);
    document.body.appendChild(loadingScreen);
    
    // 添加旋转动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // 页面加载完成后隐藏加载屏幕
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            
            setTimeout(() => {
                document.body.removeChild(loadingScreen);
            }, 500);
        }, 1000);
    });
    
    // 添加返回顶部按钮
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', '返回顶部');
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: rgba(78, 205, 196, 0.8);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // 滚动时显示/隐藏返回顶部按钮
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // 点击返回顶部
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 悬停效果
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(78, 205, 196, 1)';
        this.style.transform = 'translateY(-5px)';
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(78, 205, 196, 0.8)';
        this.style.transform = 'translateY(0)';
    });
    
    // 添加主题切换功能
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.setAttribute('aria-label', '切换主题');
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 30px;
        width: 50px;
        height: 50px;
        background: rgba(78, 205, 196, 0.8);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(themeToggle);
    
    // 主题切换逻辑
    let isDarkTheme = true;
    
    themeToggle.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        
        if (isDarkTheme) {
            document.documentElement.style.setProperty('--bg-color', '#0a0a0a');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--card-bg', '#1a1a1a');
            this.innerHTML = '🌙';
        } else {
            document.documentElement.style.setProperty('--bg-color', '#f5f5f5');
            document.documentElement.style.setProperty('--text-color', '#333333');
            document.documentElement.style.setProperty('--card-bg', '#ffffff');
            this.innerHTML = '☀️';
        }
    });
    
    // 悬停效果
    themeToggle.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(78, 205, 196, 1)';
        this.style.transform = 'translateY(-5px)';
    });
    
    themeToggle.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(78, 205, 196, 0.8)';
        this.style.transform = 'translateY(0)';
    });
    
    // 添加页面性能监控
    const performanceMonitor = {
        init: function() {
            if ('performance' in window) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                        console.log(`页面加载时间: ${loadTime}ms`);
                        
                        // 如果加载时间过长，显示提示
                        if (loadTime > 3000) {
                            this.showPerformanceTip();
                        }
                    }, 0);
                });
            }
        },
        
        showPerformanceTip: function() {
            const tip = document.createElement('div');
            tip.className = 'performance-tip';
            tip.textContent = '页面加载较慢，建议检查网络连接或刷新页面';
            tip.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 107, 107, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 1000;
                animation: fadeInOut 5s ease-in-out;
            `;
            
            document.body.appendChild(tip);
            
            // 5秒后移除提示
            setTimeout(() => {
                document.body.removeChild(tip);
            }, 5000);
        }
    };
    
    // 初始化性能监控
    performanceMonitor.init();
    
    // 添加淡入淡出动画
    const fadeAnimation = document.createElement('style');
    fadeAnimation.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            20% { opacity: 1; transform: translateX(-50%) translateY(0); }
            80% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(fadeAnimation);
    
    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // Alt + T: 切换主题
        if (e.altKey && e.key === 't') {
            themeToggle.click();
        }
        
        // Alt + H: 返回顶部
        if (e.altKey && e.key === 'h') {
            backToTopBtn.click();
        }
        
        // Alt + P: 暂停/继续游戏（如果在游戏预览区域）
        if (e.altKey && e.key === 'p') {
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn && !pauseBtn.disabled) {
                pauseBtn.click();
            }
        }
    });
    
    // 添加页面可见性API，优化性能
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面不可见时暂停动画和定时器
            console.log('页面已隐藏，暂停资源消耗');
        } else {
            // 页面可见时恢复动画和定时器
            console.log('页面已显示，恢复资源消耗');
        }
    });
    
    // 添加触摸手势支持（移动端）
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // 水平滑动
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            // 在截图轮播区域处理水平滑动
            const carousel = document.querySelector('.screenshots-carousel');
            if (carousel) {
                const carouselRect = carousel.getBoundingClientRect();
                if (
                    touchStartX >= carouselRect.left &&
                    touchStartX <= carouselRect.right &&
                    touchStartY >= carouselRect.top &&
                    touchStartY <= carouselRect.bottom
                ) {
                    if (diffX > 0) {
                        // 向左滑动，下一张
                        document.querySelector('.next-btn').click();
                    } else {
                        // 向右滑动，上一张
                        document.querySelector('.prev-btn').click();
                    }
                }
            }
        }
        
        // 垂直滑动
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // 向上滑动，可以添加导航到下一个section的逻辑
                console.log('向上滑动');
            } else {
                // 向下滑动，可以添加导航到上一个section的逻辑
                console.log('向下滑动');
            }
        }
    });
    
    // 添加错误处理
    window.addEventListener('error', function(e) {
        console.error('页面错误:', e.error);
        
        // 创建错误提示
        const errorTip = document.createElement('div');
        errorTip.className = 'error-tip';
        errorTip.textContent = '页面出现错误，部分功能可能无法正常使用';
        errorTip.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(errorTip);
        
        // 5秒后移除提示
        setTimeout(() => {
            if (document.body.contains(errorTip)) {
                document.body.removeChild(errorTip);
            }
        }, 5000);
    });
});