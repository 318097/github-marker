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
    const listElements = document.querySelectorAll(".Box .Box-body li");
    listElements.forEach(listElement => {
      const link = listElement.querySelector("a");
      if (link) {
        const spanElement = document.createElement("span");
        spanElement.setAttribute("class", "checkboxContainer");

        const linkUrl = link.href;
        const isChecked = database[linkUrl];

        if (isChecked) {
          listElement.setAttribute("class", "finished");
        }

        const checkbox = document.createElement("input");
        checkbox.checked = isChecked;
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("class", "checkbox");
        checkbox.setAttribute("data-url", linkUrl);

        spanElement.appendChild(checkbox);

        listElement.insertBefore(spanElement, listElement.childNodes[0]);
      }
    });
  }

  function handleClick(event) {
    if (
      event.target.type === "checkbox" &&
      event.target.className === "checkbox"
    ) {
      const url = event.target.getAttribute("data-url");
      const checkedValue = event.target.checked;
      saveData(url, "checked", checkedValue);
    }
  }

  init();
};
