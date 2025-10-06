// course-script.js

document.addEventListener('DOMContentLoaded', function() {
    // Elementi del DOM
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const indexLinks = document.querySelectorAll('.index-link');
    const copyButtons = document.querySelectorAll('.copy-button');
    const sections = document.querySelectorAll('.course-section');

    // Toggle menu mobile
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            sidebar.classList.toggle('active');
        });

        // Chiudi menu quando si clicca su un link
        indexLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });

        // Chiudi menu quando si clicca fuori
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    }

    // Smooth scroll per i link dell'indice
    indexLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer per evidenziare la sezione attiva nell'indice
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Rimuovi classe active da tutti i link
                indexLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Aggiungi classe active al link corrispondente
                const activeLink = document.querySelector(`.index-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Osserva tutte le sezioni
    sections.forEach(section => {
        observer.observe(section);
    });

    // Funzionalità copia codice
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeBlock = this.closest('.code-block');
            const code = codeBlock.querySelector('code');
            const textToCopy = code.textContent;

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copiato!';
                this.classList.add('copied');

                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Errore nella copia:', err);
                this.textContent = 'Errore';
                
                setTimeout(() => {
                    this.textContent = 'Copia';
                }, 2000);
            });
        });
    });

    // Animazione in entrata per le sezioni quando diventano visibili
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Scroll effect per forme di sfondo
    let lastScrollTop = 0;
    let ticking = false;

    window.addEventListener('scroll', function() {
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const shapes = document.querySelectorAll('.shape');
                shapes.forEach((shape, index) => {
                    const speed = 0.5 + (index * 0.2);
                    const yPos = -(lastScrollTop * speed);
                    shape.style.transform = `translateY(${yPos}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // Gestione ridimensionamento finestra
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        }, 250);
    });

    // Previeni comportamento predefinito per anchor link
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
            }
        });
    });

    // Hover effect sui code block
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // Debug log
    console.log('Course script loaded successfully');
    console.log(`Found ${sections.length} sections`);
    console.log(`Found ${indexLinks.length} index links`);
    console.log(`Found ${copyButtons.length} copy buttons`);
});

// Funzione per aggiungere nuove sezioni dinamicamente
function addNewSection(sectionData) {
    const contentWrapper = document.querySelector('.content-wrapper');
    
    const section = document.createElement('section');
    section.className = 'course-section';
    section.id = sectionData.id;
    
    section.innerHTML = `
        <h2 class="section-title">${sectionData.title}</h2>
        <div class="text-content">
            ${sectionData.content}
        </div>
    `;
    
    contentWrapper.appendChild(section);
    
    // Aggiungi al menu laterale
    const indexList = document.querySelector('.index-list');
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${sectionData.id}" class="index-link">${sectionData.title}</a>`;
    indexList.appendChild(li);
}

// Funzione per aggiungere code block dinamicamente
function addCodeBlock(container, language, code) {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'code-block';
    
    codeBlock.innerHTML = `
        <div class="code-header">
            <span class="code-language">${language}</span>
            <button class="copy-button">Copia</button>
        </div>
        <pre><code>${escapeHtml(code)}</code></pre>
    `;
    
    container.appendChild(codeBlock);
    
    const copyButton = codeBlock.querySelector('.copy-button');
    copyButton.addEventListener('click', function() {
        const code = this.closest('.code-block').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.textContent = 'Copiato!';
            this.classList.add('copied');
            setTimeout(() => {
                this.textContent = 'Copia';
                this.classList.remove('copied');
            }, 2000);
        });
    });
}

// Utility function per escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Export per utilizzo in altri script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addNewSection,
        addCodeBlock
    };
}
