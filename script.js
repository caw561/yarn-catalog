let yarns = [];

fetch("Yarn.csv")
  .then((response) => response.text())
  .then((csvText) => {
    yarns = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data; // Assign parsed data to the global `yarns` variable

    console.log(yarns); // Check parsed data
    renderBooks(yarns); // Render items
  })
  .catch((error) => console.error("Error loading CSV:", error));

let grid = document.querySelector(".yarn-grid");

let renderBooks = (data) => {
  grid.innerHTML = ""; // Clear previous content
  data.forEach((yarn) => {
    let newDiv = document.createElement("div");
    newDiv.classList.add("yarn-item"); // Add a class for filtering
    newDiv.dataset.color = yarn["simplified-color"];
    newDiv.dataset.brand = yarn.brand;
    newDiv.dataset.weight = yarn.weight;
    newDiv.dataset.material = yarn.material;

    newDiv.innerHTML = `
      <div class="yarn-boxes">
        <h3>${yarn.color}</h3>
        <div class="white_background">
          <img src=${yarn.image} alt="YARN" width="100%">
        </div>
      </div>`
    newDiv.style.backgroundColor = yarn["hex-color"];
    newDiv.addEventListener("click", () => showYarnModal(yarn));
    if (yarn.stock === "FALSE") {
      newDiv.classList.add("out-of-stock");
    }
    grid.append(newDiv);
  });
};

function showYarnModal(yarn) {
  const modal = document.getElementById("yarnModal");
  const details = document.getElementById("modalDetails");
  const overlay = document.getElementById("modalOverlay");

  details.innerHTML = `
    <div class="modal_white_background">
      <img src=${yarn.image} alt="YARN" width="100%">
    </div>
    <div>
      <p>Brand: ${yarn.brand}</p>
      <p>Color: ${yarn.color}</p>
      <p>Weight: ${yarn.weight}</p>
      <p>Material: ${yarn.material}</p>
      <p>Skein Stock: ${yarn.skeins}</p>
      <a href="${yarn.link}" target="_blank">Buy More</a>
    </div>
  `;

  modal.classList.add("show");
  overlay.classList.add("show");
}

document.querySelector(".close-button").addEventListener("click", () => {
  document.getElementById("yarnModal").classList.remove("show");
  document.getElementById("modalOverlay").classList.remove("show");
});

// Optional: Close modal by clicking the overlay
document.getElementById("modalOverlay").addEventListener("click", () => {
  document.getElementById("yarnModal").classList.remove("show");
  document.getElementById("modalOverlay").classList.remove("show");
});


// Filter dropdown elements
const colorFilter = document.getElementById("colorFilter");
const brandFilter = document.getElementById("brandFilter");
const weightFilter = document.getElementById("weightFilter");
const materialFilter = document.getElementById("materialFilter");

function filterItems() {
  let selectedColor = colorFilter.value;
  let selectedBrand = brandFilter.value;
  let selectedWeight = weightFilter.value;
  let selectedMaterial = materialFilter.value;

  document.querySelectorAll(".yarn-item").forEach(item => {
    let matchesColor = selectedColor === "all" || item.dataset.color === selectedColor;
    let matchesBrand = selectedBrand === "all" || item.dataset.brand === selectedBrand;
    let matchesWeight = selectedWeight === "all" || item.dataset.weight === selectedWeight;
    let matchesMaterial = selectedMaterial === "all" || item.dataset.material === selectedMaterial;

    if (matchesColor && matchesBrand && matchesWeight && matchesMaterial) {
      item.classList.remove("hide");
    } else {
      item.classList.add("hide");
    }
  });
}

// Attach event listeners
colorFilter.addEventListener("change", filterItems);
brandFilter.addEventListener("change", filterItems);
weightFilter.addEventListener("change", filterItems);
materialFilter.addEventListener("change", filterItems);

      