// 截图轮播组件增强功能
document.addEventListener('DOMContentLoaded', function() {
    // 创建截图轮播的图片占位符
    const screenshotItems = document.querySelectorAll('.screenshot-item');
    
    // 为每个截图项添加图片
    const screenshotData = [
        { 
            id: 1, 
            title: '游戏开始界面', 
            description: '蜜蜂大战飞机的开始界面，玩家可以选择开始游戏或退出',
            color: '#4ecdc4'
        },
        { 
            id: 2, 
            title: '游戏进行中', 
            description: '玩家控制蜜蜂飞机，躲避敌机并发射子弹',
            color: '#ff6b6b'
        },
        { 
            id: 3, 
            title: '特殊武器', 
            description: '使用Q/W/E/R键释放不同类型的特殊武器',
            color: '#ffe66d'
        },
        { 
            id: 4, 
            title: '爆炸效果', 
            description: '击中敌机后的爆炸动画效果',
            color: '#ff8c42'
        },
        { 
            id: 5, 
            title: '游戏结束', 
            description: '游戏结束界面，显示最终得分',
            color: '#a8e6cf'
        }
    ];
    
    // 生成截图内容
    screenshotItems.forEach((item, index) => {
        if (index < screenshotData.length) {
            const data = screenshotData[index];
            
            // 创建截图占位符
            const screenshotPlaceholder = document.createElement('div');
            screenshotPlaceholder.className = 'screenshot-placeholder';
            screenshotPlaceholder.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, ${data.color}22 0%, ${data.color}44 100%);
                border: 2px dashed ${data.color};
                border-radius: 8px;
                color: ${data.color};
                font-weight: bold;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            `;
            
            // 添加图标
            const icon = document.createElement('div');
            icon.className = 'screenshot-icon';
            icon.style.cssText = `
                font-size: 48px;
                margin-bottom: 15px;
            `;
            icon.textContent = '🎮';
            
            // 添加标题
            const title = document.createElement('h4');
            title.textContent = data.title;
            title.style.cssText = `
                margin: 0 0 10px 0;
                font-size: 18px;
            `;
            
            // 添加描述
            const description = document.createElement('p');
            description.textContent = data.description;
            description.style.cssText = `
                margin: 0;
                font-size: 14px;
                opacity: 0.8;
            `;
            
            screenshotPlaceholder.appendChild(icon);
            screenshotPlaceholder.appendChild(title);
            screenshotPlaceholder.appendChild(description);
            
            // 将占位符添加到截图项
            item.appendChild(screenshotPlaceholder);
        }
    });
    
    // 增强轮播控制
    const carousel = document.querySelector('.screenshots-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    
    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 向左滑动，显示下一张
                nextSlide();
            } else {
                // 向右滑动，显示上一张
                prevSlide();
            }
            resetSlideInterval();
        }
    }
    
    // 增强键盘控制
    document.addEventListener('keydown', function(e) {
        // 只有当轮播区域可见时才响应键盘事件
        const carouselRect = carousel.getBoundingClientRect();
        const isVisible = carouselRect.top < window.innerHeight && carouselRect.bottom > 0;
        
        if (isVisible) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetSlideInterval();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetSlideInterval();
            }
        }
    });
    
    // 添加全屏查看功能
    screenshotItems.forEach(item => {
        item.addEventListener('dblclick', function() {
            // 创建全屏查看器
            const viewer = document.createElement('div');
            viewer.className = 'screenshot-viewer';
            viewer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            `;
            
            // 克隆当前截图项
            const clone = this.cloneNode(true);
            clone.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                transform: scale(1);
                transition: transform 0.3s ease;
            `;
            
            viewer.appendChild(clone);
            document.body.appendChild(viewer);
            
            // 点击关闭全屏查看
            viewer.addEventListener('click', function() {
                this.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(viewer);
                }, 300);
            });
            
            // 添加ESC键关闭功能
            const handleEsc = function(e) {
                if (e.key === 'Escape') {
                    viewer.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(viewer);
                        document.removeEventListener('keydown', handleEsc);
                    }, 300);
                }
            };
            
            document.addEventListener('keydown', handleEsc);
        });
    });
    
    // 添加加载动画
    screenshotItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 100 * index);
    });
    
    // 添加轮播进度指示器
    const progressContainer = document.createElement('div');
    progressContainer.className = 'carousel-progress';
    progressContainer.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: #4ecdc4;
        border-radius: 2px;
        transition: width 5s linear;
    `;
    
    progressContainer.appendChild(progressBar);
    carousel.appendChild(progressContainer);
    
    // 更新进度条
    function updateProgressBar() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.transition = 'width 5s linear';
            progressBar.style.width = '100%';
        }, 50);
    }
    
    // 重置进度条
    function resetProgressBar() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    }
    
    // 重写轮播函数以包含进度条更新
    function showSlide(index) {
        // 隐藏所有幻灯片
        screenshotItems.forEach(item => item.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // 显示当前幻灯片
        screenshotItems[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;
        updateProgressBar();
    }
    
    function nextSlide() {
        const newIndex = (currentSlide + 1) % screenshotItems.length;
        showSlide(newIndex);
    }
    
    function prevSlide() {
        const newIndex = (currentSlide - 1 + screenshotItems.length) % screenshotItems.length;
        showSlide(newIndex);
    }
    
    // 初始化进度条
    updateProgressBar();
    
    // 重写轮播定时器函数
    function resetSlideInterval() {
        clearInterval(slideInterval);
        resetProgressBar();
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // 更新按钮和指示点事件
    nextBtn.addEventListener('click', function() {
        nextSlide();
        resetSlideInterval();
    });
    
    prevBtn.addEventListener('click', function() {
        prevSlide();
        resetSlideInterval();
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
            resetSlideInterval();
        });
    });
    
    // 添加轮播暂停功能
    carousel.addEventListener('mouseenter', function() {
        clearInterval(slideInterval);
        resetProgressBar();
    });
    
    carousel.addEventListener('mouseleave', function() {
        resetSlideInterval();
    });
    
    // 初始化第一张幻灯片
    showSlide(0);
});