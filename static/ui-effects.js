document.addEventListener("DOMContentLoaded", () => {
  // 1. 跨頁面無縫轉場 (Seamless Page Transitions)
  const transitionEl = document.querySelector('.page-transition');
  if (transitionEl) {
    // 稍微延遲一下，確保畫面渲染完畢再淡出黑屏（淡入內容）
    setTimeout(() => {
      transitionEl.classList.add('is-loaded');
    }, 500); // 加長延遲，避免跟原本的 preloader 衝突
  }

  // 攔截所有站內連結 (Fade Out)
  document.querySelectorAll('a[href], .action-btn[onclick]').forEach(link => {
    link.addEventListener('click', (e) => {
      let href = link.getAttribute('href');
      
      // 如果按鈕是用 onclick 跳轉的 (例如某些舊版按鈕)
      if (!href && link.getAttribute('onclick')) {
        const match = link.getAttribute('onclick').match(/window\.location\.href=['"]([^'"]+)['"]/);
        if (match) href = match[1];
      }

      // 如果找不到跳轉目標、或是外部連結/錨點，就不攔截
      if (!href || href.startsWith('http') || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
      
      
      e.preventDefault();
      if (transitionEl) {
        transitionEl.classList.remove('is-loaded'); // 畫面變黑
        setTimeout(() => {
          window.location.href = href;
        }, 1000); // 配合 CSS 轉場時間 1.2s，提早跳轉比較順
      } else {
        window.location.href = href;
      }
    });
  });

  // 2. 沉浸式客製化游標 (Cinematic Custom Cursor)
  // 使用 pointer: coarse 來精準判斷是否為「真正的手機/平板觸控螢幕」，避免誤判帶有觸控螢幕的筆電
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const cursor = document.querySelector('.custom-cursor');
  
  if (!isTouchDevice && cursor) {
    // 使用 rAF 優化效能
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    // 游標懸停放大回饋
    const interactables = document.querySelectorAll('a, button, .creature, .opt-btn, .k-card, input');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  } else if (cursor) {
    cursor.style.display = 'none'; // 手機版直接隱藏
  }

  // 3. 磁性按鈕互動 (Magnetic Buttons with GSAP)
  if (typeof gsap !== 'undefined' && !isTouchDevice) {
    const magneticBtns = document.querySelectorAll('.opt-btn, .cta-btn, .btn-back, .btn-start');
    
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        // 將磁力強度大幅降低至 0.08，避免按鈕跑太遠
        const x = (e.clientX - rect.left - rect.width / 2) * 0.08; 
        const y = (e.clientY - rect.top - rect.height / 2) * 0.08;
        
        gsap.to(btn, { x: x, y: y, duration: 0.3, ease: "power2.out" });
      });
      
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      });
    });
  }
});
