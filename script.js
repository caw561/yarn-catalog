let yarns = [];
const sheetdbURL = "https://sheetdb.io/api/v1/ki4s3dhhmo3kl";

let closeModal = () => {
  const modal = document.getElementById("yarnModal");
  const overlay = document.getElementById("modalOverlay");

  modal.classList.remove("show");
  overlay.classList.remove("show");
  modal.scrollTop = 0;
};

// Fetch yarn data and initialize functions
fetch(sheetdbURL)
  .then((response) => response.json())
  .then((data) => {
    yarns = data;
    sortYarns(yarns, "brand");
    renderYarns(yarns);             
    setupSearch(yarns); 
  })
  .catch((error) => console.error("Error loading data from SheetDB: ", error));

let grid = document.querySelector(".yarn-grid");

let renderYarns = (data) => {
  grid.innerHTML = "";
  data.forEach((yarn) => {
    let newDiv = document.createElement("div");
    newDiv.classList.add("yarn-item");
    newDiv.dataset.simplifiedColor = yarn["simplified-color"];
    newDiv.dataset.brand = yarn.brand;
    newDiv.dataset.weight = yarn.weight;
    newDiv.dataset.material = yarn.material;

    // Create inner HTML
    newDiv.innerHTML = `
      <div class="yarn-boxes" style="color: ${yarn.dark === "TRUE" ? "#B0B0B0" : "black"};">
        <h3>${yarn.color}</h3>
        <div class="white_background">
          <img src="${yarn.image}" alt="YARN" width="100%">
        </div>
      </div>
    `;

    // Set background color
    newDiv.style.backgroundColor = yarn["hex-color"];

    // Add "out of stock" class
    if (yarn.skein === "0") {
      newDiv.classList.add("out-of-stock");
    }

    // Add "discontinued" class if applicable
    if (yarn.link.trim().toLowerCase() === "discontinued") {
      newDiv.classList.add("discontinued");
    }

    // Add click listener
    newDiv.addEventListener("click", () => showYarnModal(yarn));

    // Append to grid
    grid.append(newDiv);
  });
};


let showYarnModal = (yarn) => {
  const modal = document.getElementById("yarnModal");
  const details = document.getElementById("modalDetails");
  const overlay = document.getElementById("modalOverlay");

  details.innerHTML = `
    <div class="modal_white_background">
      <img src="${yarn.image}" alt="YARN" width="100%">
    </div>
    <div>
      <p>Brand: ${yarn.brand}</p>
      <p>Color: ${yarn.color}</p>
      <p>Weight: ${yarn.weight}</p>
      <p>Material: ${yarn.material}</p>
      <p>Skein Stock: <span id="skeinValue">${yarn.skein}</span></p>
      <a href="${yarn.link}" target="_blank">Buy More</a>
    </div>
    <div class="modal-actions" style="margin-top: 1rem; text-align: right;">
      <p id="editBtn">Edit</p>
    </div>
  `;

  modal.classList.add("show");
  overlay.classList.add("show");

  document.getElementById("editBtn").addEventListener("click", () => enterEditMode(yarn));
};

let enterEditMode = (yarn) => {
  const details = document.getElementById("modalDetails");
  details.innerHTML = `
    <div class="modal_white_background">
      <img src="${yarn.image}" alt="YARN" width="100%">
    </div>
    <div>
      <p>Brand: ${yarn.brand}</p>
      <p>Color: ${yarn.color}</p>
      <p>Weight: ${yarn.weight}</p>
      <p>Material: ${yarn.material}</p>
      <p>
        Skein Stock:
        <input type="number" id="skeinInput" value="${yarn.skein}" min="0" />
      </p>
      <a href="${yarn.link}" target="_blank">Buy More</a>
    </div>
    <div class="modal-actions">
      <button id="saveBtn">Save</button>
      <button id="deleteBtn">Delete</button>
    </div>
  `;

  document.getElementById("saveBtn").addEventListener("click", () => {
    const updatedSkein = document.getElementById("skeinInput").value;
    updateYarnSkein(yarn, updatedSkein);
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    deleteYarn(yarn);
  });
};

let updateYarnSkein = (yarn, newSkein) => {
  fetch(`${sheetdbURL}/id/${yarn.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: { skein: newSkein }
    })
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to update skein stock.");
      const index = yarns.findIndex(y => y.id === yarn.id);
      if (index !== -1) yarns[index].skein = newSkein;
      yarn.skein = newSkein;
      renderYarns(yarns);
      closeModal();
    })
    .catch(err => console.error("Error updating skein:", err));
};

let deleteYarn = (yarn) => {
  const confirmation = confirm(`Are you sure you want to delete the yarn "${yarn.color}" by ${yarn.brand}?`);
  if (!confirmation) return;

  fetch(`${sheetdbURL}/id/${yarn.id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => {
      yarns = yarns.filter(y => y.id !== yarn.id);
      renderYarns(yarns);
      closeModal();
    })
    .catch(err => console.error("Error deleting yarn:", err));
};

let addYarn = async () => {
  const modal = document.getElementById("yarnModal");
  const details = document.getElementById("modalDetails");
  const overlay = document.getElementById("modalOverlay");

  let maxId = 0;
  try {
    const response = await fetch(sheetdbURL);
    const yarns = await response.json();
    if (Array.isArray(yarns)) {
      maxId = Math.max(...yarns.map(yarn => parseInt(yarn.id, 10) || 0)) + 1;
    } else {
      console.error("Response not array", yarns);
      return;
    }
  } catch (error) {
    console.error("Error fetching yarns:", error);
    return;
  }

  details.innerHTML = `
    <section class="yarnForm">
      <h2>New Yarn Form</h2>
      <div><label>Brand:</label><input id="brand" type="text" class="yarnInput" /></div>
      <div><label>Brand Sub Name:</label><input id="brandSubName" type="text" class="yarnInput" /></div>
      <div><label>Color:</label><input id="color" type="text" class="yarnInput" /></div>
      <div><label>Color Type:</label><input id="colorType" type="text" class="yarnInput" /></div>
      <div><label>Simplified Color:</label><input id="simplifiedColor" type="text" class="yarnInput" /></div>
      <div>
        <label>Material:</label>
        <select id="material" class="yarnSelect">
          <option>Acrylic</option><option>Cotton</option><option>Polyester</option><option>Wool</option>
          <option>Silk</option><option>Alpaca</option><option>Bamboo</option><option>Blend</option><option>Other</option>
        </select>
      </div>
      <div>
        <label>Weight:</label>
        <select id="weight" class="yarnSelect">
          <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option>
        </select>
      </div>
      <div><label>Oz:</label><input id="oz" type="text" class="yarnInput" /></div>
      <div><label>Yards:</label><input id="yards" type="text" class="yarnInput" /></div>
      <div><label>Skeins:</label><input id="skeins" type="text" class="yarnInput" /></div>
      <div><label>Link:</label><input id="link" type="text" class="yarnInput" placeholder="https://" /></div>
      <div><label>Image:</label><input id="image" type="text" class="yarnInput" placeholder="yarn-images/" /></div>
      <div><label>Hex Color:</label><input id="hexColor" type="color" class="yarnInput" /></div>
      <div>
        <label>Dark:</label>
        <select id="dark" class="yarnSelect">
          <option>TRUE</option><option>FALSE</option>
        </select>
      </div>
      <div class="yarnFormButtons">
        <button class="yarnButton cancel">Cancel</button>
        <button class="yarnButton done">Done</button>
      </div>
    </section>
  `;

  modal.classList.add("show");
  overlay.classList.add("show");

  document.querySelector(".yarnButton.cancel").addEventListener("click", closeModal);

  document.querySelector(".yarnButton.done").addEventListener("click", () => {
    const imageValue = document.getElementById("image").value.trim();
    const imagePath = imageValue.startsWith("yarn-images/") ? imageValue : `yarn-images/${imageValue}`;

    const newYarn = {
      id: maxId,
      brand: document.getElementById("brand").value || "Unknown",
      "brand-sub-name": document.getElementById("brandSubName").value || "Unknown",
      color: document.getElementById("color").value || "Unknown",
      "simplified-color": document.getElementById("simplifiedColor").value || "Unknown",
      "color-type": document.getElementById("colorType").value || "Unknown",
      material: document.getElementById("material").value || "Unknown",
      weight: document.getElementById("weight").value || "Unknown",
      oz: document.getElementById("oz").value || "0",
      yds: document.getElementById("yards").value || "0",
      skein: document.getElementById("skeins").value || "0",
      link: document.getElementById("link").value || "",
      image: imagePath,
      "hex-color": document.getElementById("hexColor").value || "#FFFFFF",
      dark: document.getElementById("dark").value || "FALSE"
    };

    addYarnDB(newYarn);
    closeModal();
  });
};

let addYarnDB = (newYarn) => {
  fetch(sheetdbURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: newYarn })
  })
    .then((response) => response.json())
    .then((data) => {
      yarns.push(newYarn); 
      renderYarns(yarns);
      closeModal();
    })
    .catch((error) => console.error("Error adding yarn:", error));
};

document.querySelector(".close-button").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", closeModal);
document.getElementById("addYarnButton").addEventListener("click", addYarn);

// Filters
const colorFilter = document.getElementById("colorFilter");
const brandFilter = document.getElementById("brandFilter");
const weightFilter = document.getElementById("weightFilter");
const materialFilter = document.getElementById("materialFilter");

let filterItems = () => {
  let selectedColor = colorFilter.value.toLowerCase();
  let selectedBrand = brandFilter.value;
  let selectedWeight = weightFilter.value;
  let selectedMaterial = materialFilter.value;

  document.querySelectorAll(".yarn-item").forEach(item => {
    // Split and trim simplified-color values for more flexible matching
    let colors = item.dataset.simplifiedColor
      ? item.dataset.simplifiedColor.split(',').map(c => c.trim().toLowerCase())
      : [];

    let matchesColor = selectedColor === "all" || colors.includes(selectedColor);
    let matchesBrand = selectedBrand === "all" || item.dataset.brand === selectedBrand;
    let matchesWeight = selectedWeight === "all" || item.dataset.weight === selectedWeight;
    let matchesMaterial = selectedMaterial === "all" || item.dataset.material === selectedMaterial;

    if (matchesColor && matchesBrand && matchesWeight && matchesMaterial) {
      item.classList.remove("hide");
    } else {
      item.classList.add("hide");
    }
  });
};

colorFilter.addEventListener("change", filterItems);
brandFilter.addEventListener("change", filterItems);
weightFilter.addEventListener("change", filterItems);
materialFilter.addEventListener("change", filterItems);

// Search
let setupSearch = (data) => {
  const searchInput = document.getElementById("searchInput");
  const fuse = new Fuse(data, {
    keys: ["brand", "brand-sub-name", "color", "material", "weight", "color-type", "simplified-color"],
    threshold: 0.5
  });

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim();
    const results = searchTerm ? fuse.search(searchTerm).map(result => result.item) : data;
    renderYarns(results);
  });
};

// Sort
let sortYarns = (data, key = "brand") => {
  return [...data].sort((a, b) => {
    const aVal = (a[key] || "").toLowerCase();
    const bVal = (b[key] || "").toLowerCase();
    return aVal.localeCompare(bVal);
  });
};

document.querySelectorAll("#sortOptions input[name='sort']").forEach(radio => {
  radio.addEventListener("change", () => {
    const selectedSort = document.querySelector("#sortOptions input[name='sort']:checked").value;
    yarns = sortYarns(yarns, selectedSort); 
    renderYarns(yarns);
  });
});
