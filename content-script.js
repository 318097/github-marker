const config = {
  storage: "CHROME",
  dbName: "githubMarker"
};

let database = {};

function getDomain() {
  const url = window.location.href;
  const arr = url.split("?");
  return arr[0];
}

function getDataFromChromStorage(key, cb) {
  chrome.storage.sync.get(key, cb);
}

function saveData(url, key) {
  if (config.storage === "CHROME") {
    getDataFromChromStorage(config.dbName, data => {
      const storageData = data[config.dbName] || {};
      const domain = getDomain();
      const domainData = storageData[domain] || {};

      if (!domainData[url])
        domainData[url] = { checked: false, favorite: false, bookmark: false };

      domainData[url][key] = !domainData[url][key];

      const updatedData = { ...storageData, [domain]: domainData };
      chrome.storage.sync.set({ [config.dbName]: updatedData });
    });
  }
}

// function clearNotes() {
//   chrome.storage.sync.clear(() => console.log("Cleared..."));
// }

window.onload = () => {
  function init() {
    document.addEventListener("click", handleClick);

    if (config.storage === "LOCALSTORAGE") {
      const localDB = localStorage.getItem(config.dbName);
      database = JSON.parse(localDB || "{}");
      initializeAppWithData();
    } else if (config.storage === "CHROME") {
      getDataFromChromStorage(config.dbName, data => {
        console.log("Data::", data);
        const domain = getDomain();
        const storageData = data[config.dbName] || {};
        database = storageData[domain] || {};
        initializeAppWithData();
      });
    }
  }

  function initializeAppWithData() {
    const listElements = document.querySelectorAll(".Box-body li");

    const heartSVG = chrome.runtime.getURL("heart.svg");
    const bookmarkSVG = chrome.runtime.getURL("bookmark.svg");

    listElements.forEach(listElement => {
      const link = listElement.querySelector("a");
      if (link) {
        const linkUrl = link.href;

        const checkboxContainer = document.createElement("span");
        checkboxContainer.setAttribute("class", "gm-wrapper");
        checkboxContainer.setAttribute("title", "Link read");

        const isChecked = database[linkUrl] && database[linkUrl]["checked"];

        if (isChecked) link.setAttribute("class", "gm-checked");

        const checkbox = document.createElement("input");
        checkbox.checked = isChecked;
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("class", "gm-checkbox");
        checkbox.setAttribute("data-url", linkUrl);

        checkboxContainer.appendChild(checkbox);
        // ----------------------------------------------------------------
        const favoriteContainer = document.createElement("span");
        favoriteContainer.setAttribute("class", "gm-wrapper");
        favoriteContainer.setAttribute("title", "Favorite Link");

        const isFavorite = database[linkUrl] && database[linkUrl]["favorite"];

        if (isFavorite) link.setAttribute("class", "gm-favorite");

        const heart = document.createElement("img");
        heart.setAttribute("src", heartSVG);
        heart.setAttribute("class", "gm-heart-icon");
        heart.setAttribute("data-url", linkUrl);

        favoriteContainer.appendChild(heart);
        // ----------------------------------------------------------------
        const bookmarkContainer = document.createElement("span");
        bookmarkContainer.setAttribute("class", "gm-wrapper");
        bookmarkContainer.setAttribute("title", "Bookmark Link");

        const isBookmarked = database[linkUrl] && database[linkUrl]["bookmark"];

        if (isBookmarked) link.setAttribute("class", "gm-bookmark");

        const bookmark = document.createElement("img");
        bookmark.setAttribute("src", bookmarkSVG);
        bookmark.setAttribute("class", "gm-bookmark-icon");
        bookmark.setAttribute("data-url", linkUrl);

        bookmarkContainer.appendChild(bookmark);
        //  ----------------------------------------------------------------
        const appContainer = document.createElement("span");
        appContainer.setAttribute("class", "gm-app-container");

        const container = document.createElement("span");
        container.setAttribute("class", "gm-container");

        container.appendChild(checkboxContainer);
        container.appendChild(favoriteContainer);
        container.appendChild(bookmarkContainer);

        appContainer.appendChild(container);

        listElement.insertBefore(appContainer, listElement.childNodes[0]);
      }
    });
  }

  function handleClick(event) {
    const url = event.target.getAttribute("data-url");

    if (!url) return;

    const parentLINode = event.target.closest("li");
    const linkNode = parentLINode.querySelector("a");

    const { className } = event.target;
    let key;

    if (className === "gm-checkbox") {
      key = "checked";
      linkNode.classList.toggle("gm-checked");
    } else if (className === "gm-heart-icon") {
      key = "favorite";
      linkNode.classList.toggle("gm-favorite");
    } else if (className === "gm-bookmark-icon") {
      key = "bookmark";
      linkNode.classList.toggle("gm-bookmark");
    }
    saveData(url, key);
  }

  init();
};
