/**
 * Mathare North SDA Church - Shared JavaScript
 * Handles persistent audio player, navigation, and common UI effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Audio Player Persistence & Logic ---
    const floatingPlayer = document.getElementById('floating-player');
    const playerImg = document.getElementById('player-img');
    const playerTitle = document.getElementById('player-title');
    const playerSubtitle = document.getElementById('player-subtitle');
    const playPauseBtn = document.getElementById('player-play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const playerNext = document.getElementById('player-next');
    const playerPrev = document.getElementById('player-prev');
    const playerClose = document.getElementById('player-close');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const playerTime = document.getElementById('player-time');
    const shuffleBtn = document.getElementById('player-shuffle');
    const repeatBtn = document.getElementById('player-repeat');
    const repeatOneIndicator = document.getElementById('repeat-one-indicator');

    // Playlist Data
    const categoryPlaylists = {
        'Church Choir': {
            img: '/images/_MG_6631.JPG',
            tracks: [
                { title: 'LAODIKIA', src: 'Audio/Church Choir/LAODIKIA - MATHARE NORTH EVANGELISTIC CHOIR.mp3' },
                { title: 'AMENIGUSA NINAONA', src: 'Audio/Church Choir/AMENIGUSA  NINAONA-MATHARE NORTH EVANGELISTIC CHOIR LIVE DURING THE CAMPMEETING 2021.mp3' },
                { title: 'Bado Kitambo', src: 'Audio/Church Choir/Bado Kitambo.mp3' },
                { title: 'Gideoni', src: 'Audio/Church Choir/Gideoni.mp3' },
                { title: 'Jerusalem', src: 'Audio/Church Choir/Jerusalem.mp3' },
                { title: 'KAZI YETU HAPA CHINI', src: 'Audio/Church Choir/KAZI YETU HAPA CHINI-MATHARE NORTH EVANGELISTIC CHOIR.mp3' },
                { title: 'KWA MKONO WA BWANA', src: 'Audio/Church Choir/KWA MKONO WA BWANA__ MATHARE NORTH SDA EVANGELISTIC CHOIR- LIVE DURING MKONO WA BWANA CONCERT.mp3' },
                { title: 'Kiwewe', src: 'Audio/Church Choir/Kiwewe.mp3' },
                { title: 'Kwa Maneno', src: 'Audio/Church Choir/Kwa Maneno.mp3' },
                { title: 'Lwanda', src: 'Audio/Church Choir/Lwanda.mp3' },
                { title: 'MWISHO WA SAFARI', src: 'Audio/Church Choir/MWISHO WA SAFARI-MATHARE NORTH EVANGELISTIC CHOIR.mp3' },
                { title: 'Maisha ya mwanadamu', src: 'Audio/Church Choir/Maisha ya mwanadamu - official lyrics. Mathare north church choir.mp3' },
                { title: 'Mwanadamu', src: 'Audio/Church Choir/Mwanadamu.mp3' },
                { title: 'Nitaangaza', src: 'Audio/Church Choir/Nitaangaza.mp3' },
                { title: 'Nitakwenda', src: 'Audio/Church Choir/Nitakwenda.mp3' },
                { title: 'Njia Ya Msalaba', src: 'Audio/Church Choir/Njia Ya Msalaba.mp3' },
                { title: 'PUMZI BURE', src: 'Audio/Church Choir/PUMZI BURE  - MATHARE NORTH SDA EVANGELISTIC CHOIR.mp3' },
                { title: 'Si Kitambo', src: 'Audio/Church Choir/Si Kitambo.mp3' },
                { title: 'Tujifunze zaidi Kuhusu Mungu', src: 'Audio/Church Choir/Tujifunze zaidi Kuhusu Mungu- Mathare North Evangelistic choir.mp3' },
                { title: 'Tulieni', src: 'Audio/Church Choir/Tulieni.mp3' },
                { title: 'Upendo Wa Yesu', src: 'Audio/Church Choir/Upendo Wa Yesu.mp3' },
                { title: 'Utukufu Hata Utukufu', src: 'Audio/Church Choir/Utukufu Hata Utukufu.mp3' },
                { title: 'Wasafiri Wote', src: 'Audio/Church Choir/Wasafiri Wote.mp3' }
            ]
        },
        'Young Adults': {
            img: '/images/_MG_6328.JPG',
            tracks: [
                { title: 'TUNAKUTUKUZA', src: 'Audio/Young Adults/TUNAKUTUKUZA OFFICIAL VIDEO BY MATHARE NORTH AY.mp3' },
                { title: 'KUNA WOKOVU', src: 'Audio/Young Adults/KUNA WOKOVU OFFICAL VIDEO FT MATHARE NORTH AY.mp3' },
                { title: 'Kijito Cha Maji', src: 'Audio/Young Adults/Kijito Cha Maji.mp3' },
                { title: 'NGIMANA DUTO', src: 'Audio/Young Adults/MATHARE NORTH A.Y  NGIMANA DUTO  OFFICIAL SONG.mp3' },
                { title: 'MIMI BWANA', src: 'Audio/Young Adults/MIMI BWANA OFFICIAL VIDEO FT MATHARE NORTH AY.mp3' },
                { title: 'Polo malo', src: 'Audio/Young Adults/Polo malo - Mathare North Youths.mp3' },
                { title: 'TUNAKUSHUKURU', src: 'Audio/Young Adults/TUNAKUSHUKURU  4k-MATHARE NORTH AY ll SELAH.mp3' },
                { title: 'Yawuot Polo', src: 'Audio/Young Adults/Yawuot Polo by Mathare North Ay.mp3' }
            ]
        },
        'Ambassadors': {
            img: '/images/ambassadors.jpeg',
            tracks: [
                { title: 'Unikuze Mipaka Yangu', src: 'Audio/Ambassadors/Unikuze Mipaka Yangu.mp3' },
                { title: 'Bandari', src: 'Audio/Ambassadors/Bandari.mp3' },
                { title: 'KABOCHE POLO', src: 'Audio/Ambassadors/KABOCHE POLO -MATHARE NORTH AMBASSADORS.mp3' },
                { title: 'Kinda', src: 'Audio/Ambassadors/Kinda.mp3' },
                { title: 'Kizimbani', src: 'Audio/Ambassadors/Kizimbani.mp3' },
                { title: 'Laiti', src: 'Audio/Ambassadors/Laiti.mp3' },
                { title: 'Mapambano', src: 'Audio/Ambassadors/Mapambano.mp3' },
                { title: 'Nani hodari', src: 'Audio/Ambassadors/Nani hodari.mp3' },
                { title: 'Natafakari', src: 'Audio/Ambassadors/Natafakari.mp3' },
                { title: 'Nilikutoa Utumwani', src: 'Audio/Ambassadors/Nilikutoa Utumwani.mp3' },
                { title: 'Nitamshukuru', src: 'Audio/Ambassadors/Nitamshukuru.mp3' },
                { title: 'Tuimbe sifa', src: 'Audio/Ambassadors/Tuimbe sifa.mp3' },
                { title: 'Tutasimamaje', src: 'Audio/Ambassadors/Tutasimamaje.mp3' },
                { title: 'Yesu akuita', src: 'Audio/Ambassadors/Yesu akuita.mp3' },
                { title: 'Zamu Yangu', src: 'Audio/Ambassadors/Zamu Yangu.mp3' }
            ]
        },
        'AMO': {
            img: '/images/_MG_6634.JPG',
            tracks: [
                { title: 'WACHORE', src: 'Audio/AMO/WACHORE 4K II MATHARE NORTH SDA AMM CHOIR.mp3' },
                { title: 'CHAGUA', src: 'Audio/AMO/CHAGUA 4K II MATHARE NORTH SDA AMM CHOIR.mp3' },
                { title: 'DUNIA YAISHA', src: 'Audio/AMO/DUNIA YAISHA 4K II MATHARE NORTH SDA AMM CHOIR.mp3' }
            ]
        },
        'Pathfinders': {
            img: '/images/pathfinder.jpg',
            tracks: [
                { title: 'TUMRUDIE MUNGU', src: 'Audio/Golden doves/TUMRUDIE MUNGU MATHARE NORTH PATHFINDERS.mp3' },
                { title: 'JINA LAKO', src: 'Audio/Golden doves/JINA LAKO-MATHARE NORTH PATHFINDERS.mp3' },
                { title: 'MUDA MWINGI', src: 'Audio/Golden doves/MUDA MWINGI MATHARE NORTH PATHFINDERS CHOIR.mp3' }
            ]
        },
        'Adventurers': {
            img: '/images/adventures background.jpeg',
            tracks: [
                { title: 'Tunamshukuru', src: 'Audio/Royal lamps/Tunamshukuru  Royal Lambs Adventurers Club  Official Video.mp3' },
                { title: 'Deeper Trailer', src: 'Audio/Royal lamps/Deeper TrailerRoyal Lambs Adventurers Mathare North.mp3' },
                { title: 'SISI WATOTO', src: 'Audio/Royal lamps/THE ROYAL LAMBS  MATHARE NORTH ADVENTURER - SISI WATOTO.mp3' }
            ]
        }
    };

    let audio = window.sharedAudio || new Audio();
    window.sharedAudio = audio;

    let currentPlaylist = JSON.parse(localStorage.getItem('church_audio_playlist') || '[]');
    let currentIndex = parseInt(localStorage.getItem('church_audio_index') || '-1');
    let isShuffle = localStorage.getItem('church_audio_shuffle') === 'true';
    let repeatMode = localStorage.getItem('church_audio_repeat') || 'none'; // 'none', 'all', 'one'
    let lastTime = parseFloat(localStorage.getItem('church_audio_time') || '0');
    let wasPlaying = localStorage.getItem('church_audio_playing') === 'true';

    // Initialize UI based on stored state
    if (currentIndex !== -1 && currentPlaylist.length > 0) {
        const track = currentPlaylist[currentIndex];
        updatePlayerUI(track);
        if (floatingPlayer) {
            floatingPlayer.classList.add('active');
            floatingPlayer.classList.remove('translate-y-[200%]');
        }
        
        // Sync source
        if (!audio.src || !audio.src.includes(track.src)) {
            audio.src = track.src;
            audio.currentTime = lastTime;
        }
        
        // If it was playing, we attempt to resume (browsers might block this until user interacts)
        if (wasPlaying) {
            updatePlayState(true);
            audio.play().catch(() => {
                updatePlayState(false);
                console.log("Autoplay prevented. Waiting for user interaction.");
            });
        } else {
            updatePlayState(false);
        }
    }

    // Sync state to localStorage
    function saveState() {
        localStorage.setItem('church_audio_playlist', JSON.stringify(currentPlaylist));
        localStorage.setItem('church_audio_index', currentIndex);
        localStorage.setItem('church_audio_time', audio.currentTime);
        localStorage.setItem('church_audio_playing', !audio.paused);
        localStorage.setItem('church_audio_shuffle', isShuffle);
        localStorage.setItem('church_audio_repeat', repeatMode);
    }

    // Periodic sync
    audio.addEventListener('timeupdate', () => {
        if (!progressBar || !playerTime) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = percent + '%';
        playerTime.textContent = formatTime(audio.currentTime) + ' / ' + (isNaN(audio.duration) ? '0:00' : formatTime(audio.duration));
        
        // Save time every 1 second
        localStorage.setItem('church_audio_time', audio.currentTime);
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
    }

    function updatePlayerUI(track) {
        if (playerImg) playerImg.src = track.img || '/images/WEB LOGO-01.png';
        if (playerTitle) playerTitle.textContent = track.title;
        if (playerSubtitle) playerSubtitle.textContent = track.subtitle || track.category || 'Church Ministry';
        
        // Update shuffle/repeat UI
        if (shuffleBtn) shuffleBtn.classList.toggle('text-[#D4AF37]', isShuffle);
        if (repeatBtn) {
            repeatBtn.classList.toggle('text-[#D4AF37]', repeatMode !== 'none');
            if (repeatOneIndicator) repeatOneIndicator.classList.toggle('hidden', repeatMode !== 'one');
        }
    }

    function updatePlayState(playing) {
        if (!playIcon || !pauseIcon) return;
        if (playing) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
        localStorage.setItem('church_audio_playing', playing);
    }

    function playTrack(index) {
        if (index < 0 || index >= currentPlaylist.length) return;
        currentIndex = index;
        const track = currentPlaylist[currentIndex];
        
        audio.src = track.src;
        audio.play().then(() => {
            updatePlayState(true);
            updatePlayerUI(track);
            saveState();
        }).catch(err => {
            console.log("Autoplay blocked, waiting for interaction");
            updatePlayState(false);
            updatePlayerUI(track);
        });
        
        if (floatingPlayer) {
            floatingPlayer.classList.add('active');
            floatingPlayer.classList.remove('translate-y-[200%]');
        }
    }

    function getNextIndex() {
        if (isShuffle) {
            let nextIndex = currentIndex;
            if (currentPlaylist.length > 1) {
                while (nextIndex === currentIndex) {
                    nextIndex = Math.floor(Math.random() * currentPlaylist.length);
                }
            }
            return nextIndex;
        }
        return (currentIndex + 1) % currentPlaylist.length;
    }

    function getPrevIndex() {
        if (isShuffle) {
            let prevIndex = currentIndex;
            if (currentPlaylist.length > 1) {
                while (prevIndex === currentIndex) {
                    prevIndex = Math.floor(Math.random() * currentPlaylist.length);
                }
            }
            return prevIndex;
        }
        return (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    }

    // Controls
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                updatePlayState(true);
            } else {
                audio.pause();
                updatePlayState(false);
            }
            saveState();
        });
    }

    if (playerNext) {
        playerNext.addEventListener('click', () => playTrack(getNextIndex()));
    }

    if (playerPrev) {
        playerPrev.addEventListener('click', () => playTrack(getPrevIndex()));
    }

    if (playerClose) {
        playerClose.addEventListener('click', () => {
            audio.pause();
            updatePlayState(false);
            if (floatingPlayer) {
                floatingPlayer.classList.remove('active');
                floatingPlayer.classList.add('translate-y-[200%]');
            }
            localStorage.setItem('church_audio_playing', 'false');
            localStorage.setItem('church_audio_index', '-1');
        });
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            shuffleBtn.classList.toggle('text-[#D4AF37]', isShuffle);
            shuffleBtn.classList.toggle('text-gray-500', !isShuffle);
            saveState();
        });
    }

    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
            if (repeatMode === 'none') {
                repeatMode = 'all';
                repeatBtn.classList.add('text-[#D4AF37]');
                repeatBtn.classList.remove('text-gray-500');
                if (repeatOneIndicator) repeatOneIndicator.classList.add('hidden');
            } else if (repeatMode === 'all') {
                repeatMode = 'one';
                repeatBtn.classList.add('text-[#D4AF37]');
                repeatBtn.classList.remove('text-gray-500');
                if (repeatOneIndicator) repeatOneIndicator.classList.remove('hidden');
            } else {
                repeatMode = 'none';
                repeatBtn.classList.remove('text-[#D4AF37]');
                repeatBtn.classList.add('text-gray-500');
                if (repeatOneIndicator) repeatOneIndicator.classList.add('hidden');
            }
            saveState();
        });
    }

    audio.addEventListener('ended', () => {
        if (repeatMode === 'one') {
            playTrack(currentIndex);
        } else if (repeatMode === 'all') {
            playTrack(getNextIndex());
        } else {
            if (isShuffle || currentIndex < currentPlaylist.length - 1) {
                playTrack(getNextIndex());
            } else {
                updatePlayState(false);
                saveState();
            }
        }
    });

    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        });
    }

    // Play Trigger for category buttons
    document.querySelectorAll('.play-trigger').forEach((btn) => {
        const categoryName = btn.getAttribute('data-title');
        btn.addEventListener('click', () => {
            const category = categoryPlaylists[categoryName];
            if (!category) return;
            
            currentPlaylist = category.tracks.map(t => ({
                ...t,
                category: categoryName,
                img: category.img,
                subtitle: categoryName
            }));
            
            playTrack(0);
        });
    });

    // --- 2. Shared UI Effects (Navbar, Reveal, Mobile Menu) ---
    
    // Navbar Scroll
    const navCapsule = document.querySelector('.nav-capsule');
    const navLogo = document.getElementById('nav-logo');
    if (navCapsule && navLogo) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navCapsule.classList.add('py-2');
                navCapsule.classList.remove('py-[10px]');
                navLogo.classList.add('h-10');
                navLogo.classList.remove('h-[45px]');
            } else {
                navCapsule.classList.remove('py-2');
                navCapsule.classList.add('py-[10px]');
                navLogo.classList.add('h-[45px]');
                navLogo.classList.remove('h-10');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state
    }

    // Intersection Observer for Reveal
    if ('IntersectionObserver' in window) {
        const observerOptions = { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' 
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slidein-up');
                    entry.target.classList.remove('opacity-0');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('opacity-0');
            el.classList.add('animate-slidein-up');
        });
    }

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuBtn && mobileMenu) {
        function toggleMenu() {
            mobileMenu.classList.toggle('hidden');
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
        }
        mobileMenuBtn.addEventListener('click', toggleMenu);
        document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) toggleMenu();
        }));
    }

    // Dropdown (Membership)
    const dropdownBtn = document.getElementById('membership-dropdown-btn');
    const dropdownContent = document.getElementById('membership-dropdown-content');
    const dropdownChevron = document.getElementById('dropdown-chevron');
    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
            if (dropdownChevron) dropdownChevron.classList.toggle('rotate-180');
        });
        window.addEventListener('click', () => {
            dropdownContent.classList.remove('show');
            if (dropdownChevron) dropdownChevron.classList.remove('rotate-180');
        });
    }

    // --- 3. Back to Top Button ---
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    `;
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

