window.onload = () => {
  const config = {
    storage: "CHROME",
    dbName: "githubMarker",
  };

  let database = {};

  const checkSVG = chrome.runtime.getURL("assets/check.v2.svg");
  const checkHollowSVG = chrome.runtime.getURL("assets/check-hollow.v2.svg");
  const heartSVG = chrome.runtime.getURL("assets/heart.v2.svg");
  const heartHollowSVG = chrome.runtime.getURL("assets/heart-hollow.v2.svg");
  const bookmarkSVG = chrome.runtime.getURL("assets/bookmark.v2.svg");
  const bookmarkHollowSVG = chrome.runtime.getURL(
    "assets/bookmark-hollow.v2.svg"
  );

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
      getDataFromChromStorage(config.dbName, (data) => {
        const storageData = data[config.dbName] || {};
        const domain = getDomain();
        const domainData = storageData[domain] || {};

        if (!domainData[url])
          domainData[url] = {
            checked: false,
            favorite: false,
            bookmark: false,
          };

        domainData[url][key] = !domainData[url][key];

        const updatedData = { ...storageData, [domain]: domainData };
        chrome.storage.sync.set({ [config.dbName]: updatedData });
      });
    }
  }

  // function clearNotes() {
  //   chrome.storage.sync.clear(() => console.log("Cleared..."));
  // }

  function init() {
    document.addEventListener("click", handleClick);

    if (config.storage === "LOCALSTORAGE") {
      const localDB = localStorage.getItem(config.dbName);
      database = JSON.parse(localDB || "{}");
      initializeAppWithData();
    } else if (config.storage === "CHROME") {
      getDataFromChromStorage(config.dbName, (data) => {
        console.log("Data::", data);
        const domain = getDomain();
        const storageData = data[config.dbName] || {};
        database = storageData[domain] || {};
        initializeAppWithData();
      });
    }
  }

  function getIcon({ action, isActive }) {
    if (action === "favorite") return isActive ? heartSVG : heartHollowSVG;
    else if (action === "checked") return isActive ? checkSVG : checkHollowSVG;
    else if (action === "bookmark")
      return isActive ? bookmarkSVG : bookmarkHollowSVG;
  }

  function createActionNode({ title, action, iconClassName, linkUrl, link }) {
    const containerNode = document.createElement("span");
    containerNode.setAttribute("class", "gm-wrapper");
    containerNode.setAttribute("title", title);

    const isActive = database[linkUrl] && database[linkUrl][action];

    if (isActive) link.setAttribute("class", `gm-${action}`);

    const iconNode = document.createElement("img");
    iconNode.setAttribute("src", getIcon({ action, isActive }));
    iconNode.setAttribute("class", iconClassName);
    iconNode.setAttribute("data-url", linkUrl);

    containerNode.appendChild(iconNode);

    return containerNode;
  }

  function initializeAppWithData() {
    const listElements = document.querySelectorAll(".Box-body li");

    listElements.forEach((listElement) => {
      const link = listElement.querySelector("a");
      if (link) {
        const linkUrl = link.href;

        // const checkboxContainer = document.createElement("span");
        // checkboxContainer.setAttribute("class", "gm-wrapper");
        // checkboxContainer.setAttribute("title", "Link read");

        // const isChecked = database[linkUrl] && database[linkUrl]["checked"];

        // if (isChecked) link.setAttribute("class", "gm-checked");

        // const checkbox = document.createElement("input");
        // checkbox.checked = isChecked;
        // checkbox.setAttribute("type", "checkbox");
        // checkbox.setAttribute("class", "gm-checkbox");
        // checkbox.setAttribute("data-url", linkUrl);

        // checkboxContainer.appendChild(checkbox);

        const checkboxContainer = createActionNode({
          title: "Link read",
          action: "checked",
          iconClassName: "gm-checkbox-icon",
          linkUrl,
          link,
        });

        const favoriteContainer = createActionNode({
          title: "Favorite Link",
          action: "favorite",
          iconClassName: "gm-heart-icon",
          linkUrl,
          link,
        });

        const bookmarkContainer = createActionNode({
          title: "Bookmark Link",
          action: "bookmark",
          iconClassName: "gm-bookmark-icon",
          linkUrl,
          link,
        });

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

    if (className === "gm-checkbox-icon") {
      key = "checked";
      linkNode.classList.toggle("gm-checked");
    } else if (className === "gm-heart-icon") {
      key = "favorite";
      linkNode.classList.toggle("gm-favorite");
    } else if (className === "gm-bookmark-icon") {
      key = "bookmark";
      linkNode.classList.toggle("gm-bookmark");
    }

    const newStatus = !(database[url] && database[url][key]);
    event.target.src = getIcon({ action: key, isActive: newStatus });
    saveData(url, key);
  }

  init();
};
