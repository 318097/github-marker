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

function saveData(url, key = "checked", value) {
  if (config.storage === "CHROME") {
    getDataFromChromStorage(config.dbName, data => {
      const storageData = data[config.dbName] || {};
      const domain = getDomain();
      const domainData = storageData[domain] || {};

      if (!domainData[url]) {
        domainData[url] = { checked: false };
      }

      domainData[url][key] = value;

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
    const heartLogo = chrome.runtime.getURL("heart.svg");

    listElements.forEach(listElement => {
      const link = listElement.querySelector("a");
      if (link) {
        const checkboxContainer = document.createElement("span");
        checkboxContainer.setAttribute("class", "gm-wrapper");

        const linkUrl = link.href;
        const isChecked = database[linkUrl] && database[linkUrl]["checked"];

        if (isChecked) {
          listElement.setAttribute("class", "gm-checked");
        }

        const checkbox = document.createElement("input");
        checkbox.checked = isChecked;
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("class", "gm-checkbox");
        checkbox.setAttribute("data-url", linkUrl);

        checkboxContainer.appendChild(checkbox);
        // ----------------------------------------------------------------
        const favoriteContainer = document.createElement("span");
        favoriteContainer.setAttribute("class", "gm-wrapper");

        const heart = document.createElement("img");
        heart.setAttribute("src", heartLogo);
        heart.setAttribute("class", "gm-heart-icon");

        favoriteContainer.appendChild(heart);
        //  ----------------------------------------------------------------
        const appContainer = document.createElement("span");
        appContainer.setAttribute("class", "gm-app-container");

        const container = document.createElement("span");
        container.setAttribute("class", "gm-container");

        container.appendChild(checkboxContainer);
        container.appendChild(favoriteContainer);

        appContainer.appendChild(container);

        listElement.insertBefore(appContainer, listElement.childNodes[0]);
      }
    });
  }

  function handleClick(event) {
    const { type, className } = event.target;
    if (type === "checkbox" && className === "gm-checkbox") {
      const url = event.target.getAttribute("data-url");
      const checkedValue = event.target.checked;
      saveData(url, "checked", checkedValue);
    }
  }

  init();
};
