async function loadJSON(path) {
  try {
    console.log(`Attempting to fetch: ${path}`);
    const res = await fetch(path, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
    console.log(`Fetch response for ${path}:`, res.status, res.statusText);

    if (!res.ok) {
      throw new Error(
        `Failed to load ${path}: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    console.log(`Successfully loaded ${path}:`, data);
    return data;
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    throw error;
  }
}

async function loadManifest() {
  // Since we know the file exists at the root, try simple relative path
  return loadJSON("manifest.json");
}

async function loadMeta(relativePath) {
  const path = `Files/${relativePath}/meta.json`;
  return loadJSON(path);
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children
    .flat()
    .forEach((c) =>
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
    );
  return node;
}

function renderNav(manifest) {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  const listItems = [];

  function renderLevel(data, container, depth = 0, pathPrefix = []) {
    // Safety check to prevent infinite recursion
    if (!data || typeof data !== "object" || depth > 10) {
      console.error("Invalid data or max depth reached:", {
        data,
        depth,
        pathPrefix,
      });
      return;
    }

    const keys = Object.keys(data).sort();

    for (const key of keys) {
      const value = data[key];
      const currentPath = [...pathPrefix, key];

      if (typeof value === "string" && value !== null) {
        // This is a leaf node (string = PDF filename)
        const li = el("li", {}, key);
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          listItems.forEach((x) => x.classList.remove("active"));
          li.classList.add("active");

          // Reconstruct path from JSON structure
          const fullPath = currentPath.join("/");
          showContent(fullPath, value);

          // Close mobile nav when item is selected
          if (window.innerWidth <= 1024) {
            const nav = document.getElementById("nav");
            const navOverlay = document.getElementById("nav-overlay");
            const navToggle = document.getElementById("nav-toggle");

            nav.classList.remove("open");
            navOverlay.classList.remove("active");
            navToggle.classList.remove("active");
            document.body.style.overflow = "";
          }
        });
        listItems.push(li);

        const ul = el("ul");
        ul.appendChild(li);
        container.appendChild(ul);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        // This is a branch node, create header and recurse
        const headerTag = depth === 0 ? "h2" : "h3";
        const header = el(headerTag, {}, cap(key));
        const section = el("div", {
          class: depth === 0 ? "sefer-section" : "section-level-" + depth,
        });

        // Add accordion functionality
        header.addEventListener("click", (e) => {
          e.preventDefault();
          header.classList.toggle("collapsed");
          section.classList.toggle("collapsed");
        });

        // Add accordion functionality consistently
        container.appendChild(header);
        renderLevel(value, section, depth + 1, currentPath);
        container.appendChild(section);
      } else if (value === null) {
        // Handle null values (missing PDFs) - show as disabled item
        const li = el("li", { class: "disabled" }, `${key} (No PDF)`);
        listItems.push(li);

        const ul = el("ul");
        ul.appendChild(li);
        container.appendChild(ul);
      } else {
        console.warn("Unexpected value type:", {
          key,
          value,
          type: typeof value,
        });
      }
    }
  }

  renderLevel(manifest, nav);
}

function cap(s) {
  if (!s || typeof s !== "string") {
    console.warn("cap() received invalid input:", s);
    return String(s || "");
  }

  return s.replace(
    /(^|[-_\s])(\w)/g,
    (_, p, c) => (p ? " " : "") + c.toUpperCase()
  );
}

async function showContent(relativePath, pdfFilename) {
  const pathParts = relativePath.split("/");
  const displayName = pathParts[pathParts.length - 1];

  // Create breadcrumb from path parts
  const breadcrumb = pathParts.map(cap).join(" › ");

  document.getElementById("title").textContent = cap(displayName);
  document.getElementById("crumbs").textContent = breadcrumb;

  const content = document.getElementById("content");
  content.innerHTML = "";

  // Create embeds container for YouTube + Spotify
  const embedsContainer = el("div", { class: "embeds-container" });

  // Meta (YouTube + Spotify)
  try {
    const meta = await loadMeta(relativePath);
    let hasEmbeds = false;

    if (meta.youtube) {
      let embedUrl = `https://www.youtube.com/embed/${meta.youtube}`;

      const ytWrapper = el("div", { class: "youtube-wrapper" });
      const yt = el("iframe", {
        src: embedUrl,
        title: "YouTube player",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: "",
      });
      ytWrapper.appendChild(yt);
      embedsContainer.appendChild(ytWrapper);
      hasEmbeds = true;
    }

    if (meta.spotify) {
      // Convert regular Spotify URL to embed URL if needed
      let embedUrl = `https://open.spotify.com/embed/episode/${meta.spotify}`;

      const spWrapper = el("div", { class: "spotify-wrapper" });
      const sp = el("iframe", {
        src: embedUrl,
        title: "Spotify player",
        loading: "lazy",
        allow:
          "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
      });
      spWrapper.appendChild(sp);
      embedsContainer.appendChild(spWrapper);
      hasEmbeds = true;
    }

    if (hasEmbeds) {
      content.appendChild(embedsContainer);
    }
  } catch (e) {
    console.error(e);
    const warn = el("div", {}, "Could not load meta.json for this entry.");
    content.appendChild(warn);
  }

  // PDF - Use the exact filename from manifest
  if (pdfFilename) {
    const pdfPath = `Files/${relativePath}/${pdfFilename}#navpanes=0&scrollbar=1&toolbar=1&view=FitH`;
    const pdfWrap = el(
      "div",
      { class: "pdf-wrap" },
      el("embed", { class: "pdf", src: pdfPath, type: "application/pdf" })
    );
    content.appendChild(pdfWrap);
  } else {
    const warn = el("div", {}, "No PDF file found for this entry.");
    content.appendChild(warn);
  }
}

// Mobile navigation toggle functionality
function initMobileNav() {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  const navOverlay = document.getElementById("nav-overlay");

  if (!navToggle) return; // Desktop mode

  function toggleNav() {
    const isOpen = nav.classList.contains("open");

    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  }

  function openNav() {
    nav.classList.add("open");
    navOverlay.classList.add("active");
    navToggle.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  function closeNav() {
    nav.classList.remove("open");
    navOverlay.classList.remove("active");
    navToggle.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Toggle nav when hamburger is clicked
  navToggle.addEventListener("click", toggleNav);

  // Close nav when overlay is clicked
  navOverlay.addEventListener("click", closeNav);

  // Close nav when escape key is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeNav();
    }
  });

  // Close nav when window is resized to desktop size
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeNav();
    }
  });
}

// Initialize the application
(async () => {
  try {
    const manifest = await loadManifest();
    renderNav(manifest);
    initMobileNav();
  } catch (e) {
    console.error(e);
    alert(
      "Failed to load manifest.json. Make sure you are serving over http:// (not file://) and manifest.json exists."
    );
  }
})();
