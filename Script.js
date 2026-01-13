let historyStack = [];

function scrollToContent() {
  const activePage = document.querySelector(".page.active");
  if (!activePage) return;
  const scrollContainer = activePage.querySelector(".fchoice-container");
  const target = activePage.querySelector("#content-start") || activePage.querySelector("section:nth-of-type(2)");
  if (scrollContainer && target) {
    scrollContainer.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  }
}

function scrollToNext() {
  const activePage = document.querySelector(".page.active");
  if (!activePage) return;
  const scrollContainer = activePage.querySelector(".fchoice-container");
  if (!scrollContainer) return;
  
  const sections = activePage.querySelectorAll("section, .spotlight-section");

  const currentScroll = scrollContainer.scrollTop;
  const viewportHeight = scrollContainer.clientHeight;
  
  if (currentScroll + viewportHeight >= scrollContainer.scrollHeight - 50) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  for (let i = 0; i < sections.length; i++) {
    const sectionTop = sections[i].offsetTop;
    if (sectionTop > currentScroll + 10) {
      scrollContainer.scrollTo({ top: sectionTop, behavior: "smooth" });
      break;
    }
  }
}

function setupScrollAnimation() {
  const activePage = document.querySelector(".page.active");
  if (!activePage) return;

  const header = activePage.querySelector("#sticky-header");
  const scrollContainer = activePage.querySelector(".fchoice-container");
  const scrollBtn = activePage.querySelector("#scroll-btn");
  
  const elementsToObserve = activePage.querySelectorAll(".card-section, .reveal, .spotlight-section");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const content = entry.target.querySelector(".content-box");
        const img = entry.target.querySelector("img");
        const isRevealSection = entry.target.classList.contains("reveal");

        if (entry.isIntersecting) {
          if (content) content.classList.add("active-anim");
          if (img) img.classList.add("active-anim");
          if (isRevealSection) entry.target.classList.add("active-anim");
        } else {
          if (content) content.classList.remove("active-anim");
          if (img) img.classList.remove("active-anim");
        }
      });
    },
    { threshold: 0.2 }
  );

  elementsToObserve.forEach((section) => sectionObserver.observe(section));

  if (header && scrollContainer) {
    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const viewportHeight = scrollContainer.clientHeight;
      const scrollHeight = scrollContainer.scrollHeight;

      if (scrollTop > 50) {
        header.classList.add("shrink");
      } else {
        header.classList.remove("shrink");
      }

      if (scrollBtn) {
        const isBottom = scrollTop + viewportHeight >= scrollHeight - 50;
        
        scrollBtn.style.opacity = '1';
        scrollBtn.style.pointerEvents = 'auto';

        if (isBottom) {
          scrollBtn.classList.add("rotate");
        } else {
          scrollBtn.classList.remove("rotate");
        }
      }
    };

    scrollContainer.onscroll = handleScroll;
    handleScroll();
  }
}

async function showPage(pageId, filePath, saveHistory = true) {
  const currentActive = document.querySelector(".page.active");
  if (currentActive && saveHistory) {
    historyStack.push(currentActive.id);
  }

  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    if (filePath && selectedPage.innerHTML.trim() === "") {
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          selectedPage.innerHTML = await response.text();
        }
      } catch (error) {
        console.error("Error loading file:", error);
      }
    }
    selectedPage.classList.add("active");
    if (pageId === "istrue") {
      setTimeout(() => {
        observeCardVisibility();
      }, 100);
    }

    const scrollContainer = selectedPage.querySelector(".fchoice-container");
    const header = selectedPage.querySelector("#sticky-header");
    const scrollBtn = selectedPage.querySelector("#scroll-btn");

    if (scrollContainer) scrollContainer.scrollTop = 0;
    if (header) header.classList.remove("shrink");
    if (scrollBtn) scrollBtn.classList.remove("rotate");

    setTimeout(() => {
      setupScrollAnimation();
    }, 50);
  } else {
    console.error("ไม่พบหน้านี้ใน HTML: " + pageId);
  }
}

function goBack() {
  if (historyStack.length === 0) {
    alert("ย้อนกลับไม่ได้แล้วครับ นี่หน้าแรกสุด");
    return;
  }
  const previousPageId = historyStack.pop();
  showPage(previousPageId, null, false);
}

function handleCardInteraction(event) {
  const card = event.currentTarget;
  const originalOnClick = card.getAttribute("data-navigate");

  if (window.innerWidth > 768) {
    if (originalOnClick) {
      eval(originalOnClick);
    }
    return; 
  }

  document.querySelectorAll(".card.flipped").forEach((c) => {
    if (c !== card) {
      c.classList.remove("flipped");
    }
  });

  if (card.classList.contains("flipped")) {
    if (originalOnClick) {
      eval(originalOnClick);
      return;
    }
  }
  card.classList.toggle("flipped");
  event.stopPropagation();
}

function handleGlobalUnflip(event) {
  const clickedCard = event.target.closest(".card");
  if (!clickedCard) {
    document.querySelectorAll(".card.flipped").forEach((card) => {
      card.classList.remove("flipped");
    });
  }
}

document.addEventListener("click", handleGlobalUnflip);

function observeCardVisibility() {
  const activePage = document.querySelector("#istrue.page.active");
  if (!activePage) return;

  const scrollContainer = activePage.querySelector(".card-container"); 
  if (!scrollContainer || scrollContainer.clientHeight === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active-card");
        } else {
          entry.target.classList.remove("active-card");
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0.1, 
    }
  );

  const cards = scrollContainer.querySelectorAll(".card");
  cards.forEach((card) => observer.observe(card));
  scrollContainer.scrollTop = 1;
  scrollContainer.scrollTop = 0;
}

showPage("homepage", "pages/home.html", false);