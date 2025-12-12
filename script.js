// script.js (Финальная, Гарантированно Исправленная Версия 3.0)



const ADMIN_PASSWORD = "admin123"; 

let isAdminMode = false;

const adminPanel = document.getElementById('admin-panel');

const gallery = document.getElementById('portfolio-gallery');



// --- Элементы Модального Окна ---

var modal = document.getElementById("myModal");

var modalTitle = document.getElementById('modal-title');

var imageCarousel = document.getElementById('image-carousel');

var videoList = document.getElementById('video-list');

var zoomModal = document.getElementById('zoom-modal');

var zoomContent = document.getElementById('zoom-content');





// --- Инициализация и Структура Данных (Не изменена) ---

const defaultPortfolio = [

    { 

        name: 'Кибер-Ниндзя V1', 

        thumb: 'images/char_thumb_1.jpg', 

        images: ['images/cyber_full.jpg', 'images/cyber_wireframe.jpg', 'images/cyber_mesh.jpg'],

        videos: [

            { path: 'videos/cyber_turnaround.mp4', comment: 'Полный оборот персонажа в реальном времени (Unreal Engine 5)' },

            { path: 'videos/cyber_anim.mp4', comment: 'Демонстрация базовой анимации атаки и бега.' }

        ]

    },

    { 

        name: 'Лесной Маг (Стилизация)', 

        thumb: 'images/char_thumb_2.jpg', 

        images: ['images/mage_pose_1.jpg', 'images/mage_details.jpg'],

        videos: [

            { path: 'videos/mage_render.mp4', comment: 'Финальный рендер в Marmoset Toolbag с настройкой освещения.' }

        ]

    }

];



let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || defaultPortfolio;



function savePortfolio() {

    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

    renderPortfolio();

}



// --- Функции Рендеринга Превью и Админки (Не изменены) ---

// (Оставлены для краткости, предполагая, что они работают корректно)

function renderPortfolio() {

    gallery.innerHTML = '';

    portfolioData.forEach((item, index) => {

        const itemHTML = `

            <div class="item-container">

                <div class="item" onclick="openModal(${index})">

                    <img src="${item.thumb}" alt="${item.name}">

                </div>

                <div class="item-caption">

                    ${item.name}

                    ${isAdminMode ? `<button onclick="event.stopPropagation(); deleteItem(${index});">Удалить</button>` : ''}

                </div>

            </div>

        `;

        gallery.insertAdjacentHTML('beforeend', itemHTML);

    });

}

function deleteItem(index) {

    if (confirm(`Вы уверены, что хотите удалить работу "${portfolioData[index].name}"?`)) {

        portfolioData.splice(index, 1);

        savePortfolio();

    }

}

window.addEventListener('keypress', function(e) {

    if (e.key === '/') {

        e.preventDefault();

        const input = prompt("Введите пароль администратора:");

        if (input === ADMIN_PASSWORD) {

            isAdminMode = true;

            adminPanel.style.display = 'block';

            alert("Режим администратора активирован.");

            renderPortfolio();

        } else if (input !== null) {

            alert("Неверный пароль.");

        }

    }

});

function addPortfolioItem() {

    const name = document.getElementById('name-input').value.trim();

    const thumb = document.getElementById('thumb-input').value.trim();

    const imagesStr = document.getElementById('images-input').value.trim();

    const videosStr = document.getElementById('videos-input').value.trim();



    if (!name || !thumb) {

        alert("Поля 'Название' и 'Превью' обязательны!");

        return;

    }

    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()) : [];

    const videos = videosStr ? videosStr.split(',').map(s => {

        const [path, comment] = s.trim().split('|');

        return { path: path ? path.trim() : '', comment: comment ? comment.trim() : 'Нет комментария' };

    }) : [];

    if (images.length === 0 && videos.length === 0) {

        alert("Добавьте хотя бы одно изображение или одно видео.");

        return;

    }



    const newItem = { name, thumb, images, videos };

    portfolioData.push(newItem);

    savePortfolio();



    document.getElementById('name-input').value = '';

    document.getElementById('thumb-input').value = '';

    document.getElementById('images-input').value = '';

    document.getElementById('videos-input').value = '';

    alert(`Работа "${name}" добавлена!`);

}





// --- Модальное Окно (Детальный Просмотр) и Интерактив Видео ---



let videoObserver;



// Создание Intersection Observer для автоплея видео (100% видимости)

function setupVideoObserver() {

    if (videoObserver) {

        videoObserver.disconnect();

    }



    const options = {

        // *** ИСПРАВЛЕНИЕ #1: Используем само модальное окно как root, так как оно прокручивается (overflow: auto) ***

        root: document.getElementById('myModal'), 

        rootMargin: '0px',

        threshold: 1.0 // Включать, когда 100% видео в кадре

    };



    videoObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            const video = entry.target;

            if (entry.isIntersecting) {

                // Если полностью в кадре: включаем звук и воспроизводим

                video.muted = false; 

                video.play().catch(error => console.log("Autoplay prevented:", error));

            } else {

                // Если выходит из кадра (даже частично): ставим на паузу

                video.pause();

                video.muted = true; // Снова отключаем звук

            }

        });

    }, options);



    // Начинаем наблюдение за всеми видео, которые мы добавили

    videoList.querySelectorAll('video').forEach(video => {

        videoObserver.observe(video);

    });

}



function openModal(index) {

    const item = portfolioData[index];

    modalTitle.textContent = item.name;

    imageCarousel.innerHTML = '';

    videoList.innerHTML = '';



    // 1. Загрузка Изображений (для карусели)

    if (item.images && item.images.length > 0) {

        item.images.forEach(imagePath => {

            const wrapper = document.createElement('div');

            wrapper.classList.add('carousel-image-wrapper');

            const img = document.createElement('img');

            img.src = imagePath;

            img.classList.add('carousel-image');

            img.onclick = (e) => {

                e.stopPropagation(); 

                openZoomModal(imagePath);

            };

            wrapper.appendChild(img);

            imageCarousel.appendChild(wrapper);

        });

        document.getElementById('modal-images').style.display = 'block';

    } else {

        document.getElementById('modal-images').style.display = 'none';

    }



    // 2. Загрузка Видео с Комментариями

    if (item.videos && item.videos.length > 0) {

        item.videos.forEach(videoItem => {

            const container = document.createElement('div');

            container.classList.add('video-item');

            

            const video = document.createElement('video');

            video.src = videoItem.path;

            // *** Убеждаемся, что нет атрибута 'autoplay' при создании ***

            video.controls = false; 

            video.loop = true;

            video.muted = true; // Видео всегда muted, пока не вступит в фокус

            

            // ***Показываем управление только при наведении***

            video.onmouseenter = () => { video.controls = true; };

            video.onmouseleave = () => { 

                if (video.paused || document.fullscreenElement) return;

                video.controls = false; 

            };

            

            container.appendChild(video);

            

            const comment = document.createElement('p');

            comment.classList.add('video-comment');

            comment.textContent = videoItem.comment;

            container.appendChild(comment);

            

            videoList.appendChild(container);

        });

        document.getElementById('modal-videos').style.display = 'block';

    } else {

        document.getElementById('modal-videos').style.display = 'none';

    }



    modal.style.display = "block";

    

    // Активируем Observer после загрузки видео

    setTimeout(setupVideoObserver, 500); 

}



function closeModal(event) {

    if (event.target.classList.contains('modal') || event.target.classList.contains('close')) {

        // Отключаем Observer

        if (videoObserver) {

            videoObserver.disconnect();

        }

        // Останавливаем все видео

        videoList.querySelectorAll('video').forEach(video => {

            video.pause();

            video.muted = true;

        });

        modal.style.display = "none";

    }

}



// --- Функции Карусели (Стрелки) ---

function scrollCarousel(direction) {

    const scrollAmount = imageCarousel.offsetWidth * direction;

    imageCarousel.scrollBy({

        left: scrollAmount,

        behavior: 'smooth'

    });

}



// --- Функции ZOOM Модального Окна ---

function openZoomModal(imagePath) {

    zoomContent.src = imagePath;

    zoomModal.style.display = "block";

}



function closeZoomModal(event) {

    if (event.target.id === 'zoom-modal' || event.target.id === 'zoom-close') {

        zoomModal.style.display = "none";

    }

}



// Инициализация при загрузке страницы

document.addEventListener('DOMContentLoaded', renderPortfolio);
