var data;

chrome.storage.sync.get("data", function (items) {
  console.log(items);
  if (
    items == null ||
    (Object.keys(items).length === 0 && items.constructor === Object)
  ) {
    data = {
      all: [],
    };
    chrome.storage.sync.set({ data: data });
  } else {
    data = items;
  }
  addItemsToContent(data["data"]);
  addButtonListener();
});

function addButtonListener() {
  document.getElementById("btn").addEventListener("click", function () {
    const text = document.getElementById("input").value;
    if (text in data["data"] || text.capitalize() in data["data"]) {
      document.getElementById("input").value = "";
      return;
    }
    if (text !== null && text !== undefined && text !== "") {
      data["data"][text.capitalize()] = [];
      saveData();
      var content = document.getElementById("content");
      let collapsableItem = getCollapsableItem(text.capitalize());
      content.insertBefore(collapsableItem, content.firstChild);
      addClickListenerToAddIcon(text.capitalize());
      var heading = collapsableItem.getElementsByClassName("exp-heading")[0];
      heading.addEventListener("click", function () {
        this.parentNode.classList.toggle("expanded");
        this.getElementsByClassName("expand-icon")[0].classList.toggle(
          "rotate-icon"
        );
      });
      document.getElementById("input").value = "";
    }
  });
}

function addItemsToContent(items) {
  var content = document.getElementById("content");
  for (var key in items) {
    if (items.hasOwnProperty(key)) {
      content.appendChild(getCollapsableItem(key));
      addClickListenerToAddIcon(key);
    }
  }
  addClickListenersToExpandableItems();
}

function addClickListenerToAddIcon(name) {
  let icon = document
    .getElementById(name)
    .getElementsByClassName("exp-heading")[0]
    .getElementsByTagName("h4")[0]
    .getElementsByClassName("tooltip")[0]
    .getElementsByTagName("img")[0];
  icon.addEventListener("click", function (e) {
    getCurrentTab(function (tab) {
      const _tab = getTabObject(tab);
      data["data"][name].unshift(_tab);
      saveData();
      addContentItemDivToExistingContent(name, _tab);
    });
    e.stopPropagation();
  });
}

function addContentItemDivToExistingContent(name, tab) {
  let contentItemsDiv = document
    .getElementById(name)
    .getElementsByClassName("exp-content")[0];
  contentItemsDiv.insertBefore(
    getContentItemDiv(name, tab),
    contentItemsDiv.firstChild
  );
}

function getCollapsableItem(name) {
  // creating heading icon
  let headingExpand = document.createElement("img");
  headingExpand.className = "expand-icon";
  headingExpand.src = chrome.extension.getURL("images/expand-icon.svg");
  headingExpand.alt = "expand icon";

  let headingDelete = document.createElement("img");
  headingDelete.className = "heading-delete-icon";
  headingDelete.src = chrome.extension.getURL("images/delete-icon.svg");
  headingDelete.alt = "delete icon";
  headingDelete.addEventListener("click", function (e) {
    let item = document.getElementById(name);
    item.remove();
    delete data["data"][name];
    saveData();
    e.stopPropagation();
  });

  let headingIcon = document.createElement("div");
  headingIcon.className = "head-icons";
  headingIcon.appendChild(headingExpand);
  headingIcon.appendChild(headingDelete);

  let headingText = getTooltipHeadingText(name);

  // creating heading div
  let headingDiv = document.createElement("div");
  headingDiv.className = "exp-heading";

  // inserting heading icon and text
  headingDiv.appendChild(headingText);
  headingDiv.appendChild(headingIcon);

  // creating expandable div
  let toRet = document.createElement("div");
  toRet.className = "expandable";
  toRet.id = name;

  // creating content div
  let contentDiv = getContentDiv(name);

  // inserting heading div
  toRet.appendChild(headingDiv);

  toRet.appendChild(contentDiv);
  document.getelementby;

  return toRet;
}

function getContentDiv(name) {
  let contentDiv = document.createElement("div");
  contentDiv.className = "exp-content";
  const listOfItems = data["data"][name];
  listOfItems.forEach(function (item, index) {
    contentDiv.appendChild(getContentItemDiv(name, item));
  });
  return contentDiv;
}

function getContentItemDiv(name, tab) {
  let contentItemIcon = document.createElement("img");
  contentItemIcon.className = "content-item-icon";
  contentItemIcon.alt = "?";
  contentItemIcon.src = tab.favIconUrl;

  let contentItemText = document.createElement("h6");
  contentItemText.innerHTML = tab.title;

  let contentItemDelete = document.createElement("img");
  contentItemDelete.className = "delete-icon";
  contentItemDelete.alt = "del";
  contentItemDelete.src = chrome.extension.getURL("images/delete-icon.svg");
  contentItemDelete.addEventListener("click", function (e) {
    let item = document.getElementById(tab.id);
    item.remove();
    data["data"][name].splice(data["data"][name].indexOf(tab), 1);
    saveData();
    e.stopPropagation();
  });

  let contentItemDiv = document.createElement("div");
  contentItemDiv.className = "content-item";
  contentItemDiv.id = tab.id;

  contentItemDiv.appendChild(contentItemIcon);
  contentItemDiv.appendChild(contentItemText);
  contentItemDiv.appendChild(contentItemDelete);

  contentItemDiv.addEventListener("click", function (e) {
    chrome.tabs.create({
      url: tab.url,
      selected: false,
    });
    return false;
  });

  return contentItemDiv;
}

function getTooltipHeadingText(name) {
  // creating add icon for the heading text
  let addIcon = document.createElement("img");
  addIcon.className = "add-icon";
  addIcon.src = chrome.extension.getURL("images/add-icon.svg");
  addIcon.alt = "add icon";

  // creating tooltip text for tooltip
  let tooltipText = document.createElement("span");
  tooltipText.className = "tooltiptext";
  tooltipText.innerHTML = `Add current page to <b>${name.capitalize()}</b>`;

  // creating tooltip
  let tooltip = document.createElement("span");
  tooltip.className = "tooltip";

  // adding add icon and tooltip text to tooltip
  tooltip.appendChild(addIcon);
  tooltip.appendChild(tooltipText);

  // creating heading text
  let headingText = document.createElement("h4");
  headingText.appendChild(tooltip);
  headingText.appendChild(document.createTextNode(name.capitalize()));
  // headingText.;
  // headingText.innerHTML = name.capitalize();
  return headingText;
}

function addClickListenersToExpandableItems() {
  // Adding expandable functionality
  const expandables = document.getElementsByClassName("expandable");
  for (var i = 0; i < expandables.length; i++) {
    var heading = expandables[i].getElementsByClassName("exp-heading")[0];
    heading.addEventListener("click", function () {
      this.parentNode.classList.toggle("expanded");
      this.getElementsByClassName("expand-icon")[0].classList.toggle(
        "rotate-icon"
      );
    });
  }
}

function getTabObject(tab) {
  return {
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
    id: tab.id,
  };
}

function getCurrentTab(callback) {
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function (tabs) {
      callback(tabs[0]);
    }
  );
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function saveData() {
  chrome.storage.sync.set({ data: data["data"] });
}
