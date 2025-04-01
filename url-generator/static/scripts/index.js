// Global data variable
let data = [];
let currentSortField = "name";
let currentSortDirection = "asc";

// Functions to handle sorting with size units
function parseSize(sizeStr) {
  const matches = sizeStr.match(/^([\d.]+)\s+(\w+)$/);
  if (!matches) return 0;

  const value = parseFloat(matches[1]);
  const unit = matches[2];

  const multipliers = {
    B: 1,
    KiB: 1024,
    MiB: 1024 * 1024,
    GiB: 1024 * 1024 * 1024,
    TiB: 1024 * 1024 * 1024 * 1024,
  };

  return value * (multipliers[unit] || 0);
}

function sortData(field, direction) {
  return [...data].sort((a, b) => {
    let valueA, valueB;

    if (field === "size") {
      valueA = parseSize(a[field]);
      valueB = parseSize(b[field]);
    } else if (field === "last_modify") {
      valueA = new Date(a[field]);
      valueB = new Date(b[field]);
    } else {
      valueA = a[field];
      valueB = b[field];
    }

    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

// Render table function
function renderTable(
  sortField = currentSortField,
  sortDirection = currentSortDirection
) {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  // Update current sort parameters
  currentSortField = sortField;
  currentSortDirection = sortDirection;

  if (data.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = "No data available";
    cell.style.textAlign = "center";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  const sortedData = sortData(sortField, sortDirection);

  sortedData.forEach((item) => {
    const row = document.createElement("tr");
    row.onclick = () => {
      window.location.href = `/generator/${item.name}`;
    };

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;
    row.appendChild(nameCell);

    const dateCell = document.createElement("td");
    dateCell.textContent = item.last_modify;
    row.appendChild(dateCell);

    const sizeCell = document.createElement("td");
    sizeCell.textContent = item.size;
    sizeCell.className = "size-column";
    row.appendChild(sizeCell);

    tableBody.appendChild(row);
  });

  // Update headers to show sort indicators
  document.querySelectorAll("th").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.sort === sortField) {
      th.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

// Fetch data from API
async function fetchData() {
  try {
    const response = await fetch("/files");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    data = await response.json();
    renderTable();
  } catch (error) {
    alert("Error fetching data:", error);

    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "error-message";
    cell.textContent = `Failed to load data: ${error.message}`;
    row.appendChild(cell);
    tableBody.appendChild(row);
  }
}

// Add click event listeners to headers for sorting
document.querySelectorAll("th").forEach((th) => {
  th.addEventListener("click", () => {
    const sortField = th.dataset.sort;

    // Determine sort direction
    let sortDirection = "asc";
    if (sortField === currentSortField && currentSortDirection === "asc") {
      sortDirection = "desc";
    }

    renderTable(sortField, sortDirection);
  });
});

// Initialize by fetching data when the page loads
document.addEventListener("DOMContentLoaded", fetchData);
