// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 截图轮播功能
const carouselSlides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentSlide = 0;

function showSlide(index) {
    // 隐藏所有幻灯片
    carouselSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // 显示当前幻灯片
    carouselSlides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % carouselSlides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
    showSlide(currentSlide);
}

// 自动轮播
let slideInterval = setInterval(nextSlide, 5000);

// 手动切换
prevBtn.addEventListener('click', function() {
    prevSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
});

nextBtn.addEventListener('click', function() {
    nextSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
});

// 滚动动画
const fadeElements = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(element => {
    observer.observe(element);
});

// 移动端导航菜单
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 导航链接点击事件
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
        
        // 关闭移动端菜单
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 游戏控制说明交互
const gameControls = document.querySelector('.game-controls');
if (gameControls) {
    const controlItems = gameControls.querySelectorAll('li');
    controlItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
}

// 下载按钮交互
const downloadButtons = document.querySelectorAll('.download-buttons .btn');
downloadButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // 这里可以添加下载逻辑
        alert('下载功能将在后续版本中实现');
    });
});

// 页面加载完成后的初始化
window.addEventListener('DOMContentLoaded', function() {
    // 显示第一张幻灯片
    showSlide(currentSlide);
    
    // 添加滚动动画类
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
    });
    
    // 初始化导航栏状态
    if (window.scrollY > 50) {
        document.querySelector('.navbar').classList.add('scrolled');
    }
});

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化滚动事件
window.addEventListener('scroll', debounce(function() {
    // 滚动相关的优化操作
}, 10));

// 懒加载图片
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.src;
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => {
    imageObserver.observe(img);
});

// 键盘导航支持
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
            prevSlide();
            break;
        case 'ArrowRight':
            nextSlide();
            break;
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(slideInterval);
    } else {
        slideInterval = setInterval(nextSlide, 5000);
    }
});

// 错误处理：确保所有元素都存在
function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

// 初始化所有功能
try {
    // 导航栏
    const navbar = safeQuerySelector('.navbar');
    if (navbar) {
        // 导航栏相关功能已在上面实现
    }
    
    // 轮播
    const carousel = safeQuerySelector('.screenshot-carousel');
    if (carousel) {
        // 轮播相关功能已在上面实现
    }
    
    // 游戏控制
    const gameControls = safeQuerySelector('.game-controls');
    if (gameControls) {
        // 游戏控制相关功能已在上面实现
    }
    
    console.log('页面功能初始化完成');
} catch (error) {
    console.error('页面功能初始化失败:', error);
}