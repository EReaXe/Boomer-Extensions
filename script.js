document.addEventListener('DOMContentLoaded', async () => {
    const timeline = document.querySelector('.timeline');
    const ITEMS_PER_PAGE = 5; // Her sayfada gösterilecek öğe sayısı
    let currentPage = 1;
    let allData = [];
    
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data || !data.roadmapItems || !Array.isArray(data.roadmapItems)) {
            throw new Error('Geçersiz veri formatı!');
        }

        allData = data.roadmapItems;
        
        // Sayfalama kontrollerini oluştur
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        timeline.parentElement.appendChild(paginationContainer);

        function updatePagination() {
            const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE);
            paginationContainer.innerHTML = `
                <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-info">${currentPage} / ${totalPages}</span>
                <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        function renderPage(page) {
            const start = (page - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = allData.slice(start, end);
            
            timeline.innerHTML = ''; // Mevcut içeriği temizle
            
            pageItems.forEach((item, index) => {
                const timelineItem = document.createElement('div');
                timelineItem.className = `timeline-item ${item.status}`;
                
                const content = `
                    <div class="timeline-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="status">${item.statusText}</span>
                    </div>
                `;
                
                timelineItem.innerHTML = content;
                timeline.appendChild(timelineItem);
                
                // Animasyon için başlangıç stillerini ayarla
                timelineItem.style.opacity = 0;
                timelineItem.style.transform = index % 2 === 0 
                    ? 'translateX(-50px)' 
                    : 'translateX(50px)';
                timelineItem.style.transition = 'all 0.5s ease';
            });

            // Intersection Observer oluştur
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = 1;
                        entry.target.style.transform = 'translateX(0)';
                    }
                });
            }, {
                threshold: 0.5
            });
            
            // Timeline öğelerini observe et
            document.querySelectorAll('.timeline-item').forEach(item => {
                observer.observe(item);
            });

            updatePagination();
        }

        // Sayfa değiştirme fonksiyonunu global scope'a ekle
        window.changePage = (newPage) => {
            const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE);
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                renderPage(currentPage);
                // Sayfanın en üstüne yumuşak geçiş
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        // İlk sayfayı göster
        renderPage(currentPage);
        
    } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        timeline.innerHTML = `
            <div class="error-message">
                <p>⚠️ Roadmap verileri yüklenirken bir hata oluştu.</p>
                <p class="error-details">Lütfen sayfayı bir web sunucusu üzerinden açtığınızdan emin olun.</p>
                <p class="error-help">GitHub Pages üzerinden yayınlandığında bu hata ortadan kalkacaktır.</p>
            </div>
        `;
    }
}); 
