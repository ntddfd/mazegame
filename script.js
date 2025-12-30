let ROWS,
  COLS,
  grid = [],
  start = null,
  end = null;
let mode = null;

const maze = document.getElementById("maze");
const table = document.getElementById("resultTable");

/* ===== ACTIVE BUTTON ===== */
function setActive(groupId, btn) {
  document
    .querySelectorAll(`#${groupId} button`)
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ===== MODE ===== */
function setMode(m, btn) {
  mode = m;
  setActive("drawModes", btn);
}

/* ===== MAZE ===== */
function createMaze() {
  const rowsInput = document.getElementById("rows");
  const colsInput = document.getElementById("cols");
  ROWS = +rows.value;
  COLS = +cols.value;
  grid = [];
  start = end = null;
  maze.innerHTML = "";

  // kích thước của vùng chứa (maze-wrapper)
  const wrapper = document.querySelector(".maze-wrapper");
  const maxWidth = wrapper.clientWidth - 40; // Trừ đi padding
  const maxHeight = wrapper.clientHeight - 40;

  // kích thước ô tối ưu, lấy giá trị nhỏ nhất giữa (chiều rộng/số cột) và (chiều cao/số hàng)
  let cellSize = Math.floor(Math.min(maxWidth / COLS, maxHeight / ROWS));

  // Giới hạn kích thước tối đa là 25px để map nhỏ không bị quá to, và tối thiểu là 5px để vẫn nhìn thấy được.
  cellSize = Math.max(5, Math.min(cellSize, 25));
  maze.style.gridTemplateRows = `repeat(${ROWS}, ${cellSize}px)`;
  maze.style.gridTemplateColumns = `repeat(${COLS}, ${cellSize}px)`;

  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      let el = document.createElement("div");
      el.className = "cell";
      el.onclick = () => clickCell(r, c);
      maze.appendChild(el);
      row.push({ r, c, wall: false, visited: false, parent: null, g: 0, el });
    }
    grid.push(row);
  }
}

function clickCell(r, c) {
  let cell = grid[r][c];

  if (!mode) {
    alert("Vui lòng chọn chức năng!");
    return; //nếu chưa chọn chế độ thì thoát hàm
  }
  //không cho phép đặt tường trùng với điểm start/end
  if (mode === "wall") {
    if (cell === start || cell === end) return;
    cell.wall = !cell.wall;
    cell.el.classList.toggle("wall");
  } else if (mode === "start") {
    if (start) start.el.classList.remove("start");
    if (cell.wall) (cell.wall = false), cell.el.classList.remove("wall"); //xoá wall khi đặt start trùng
    start = cell;
    cell.el.classList.add("start");
  } else if (mode === "end") {
    if (end) end.el.classList.remove("end");
    if (cell.wall) (cell.wall = false), cell.el.classList.remove("wall"); //xoá wall khi đặt end trùng
    end = cell;
    cell.el.classList.add("end");
  }
}

function resetMaze() {
  for (let row of grid)
    for (let cell of row) {
      cell.visited = false;
      cell.parent = null;
      cell.g = 0;
      cell.el.className = "cell" + (cell.wall ? " wall" : "");
    }
  if (start) start.el.classList.add("start");
  if (end) end.el.classList.add("end");
}

/* ===== ALGORITHMS ===== */
function neighbors(c) {
  return [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
    .map(([dr, dc]) => grid[c.r + dr]?.[c.c + dc])
    .filter((n) => n && !n.wall && !n.visited);
}

function h(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

async function run(type, btn) {
  if (!start || !end) {
    alert("Cần đặt Start và End");
    return;
  }

  setActive("algoButtons", btn);
  resetMaze();

  let open = [start],
    visited = 0;
  start.visited = true;

  let t0 = performance.now();

  while (open.length) {
    let cur;
    if (type === "DFS") cur = open.pop();
    else if (type === "GREEDY") {
      open.sort((a, b) => h(a, end) - h(b, end));
      cur = open.shift();
    } else if (type === "ASTAR") {
      open.sort((a, b) => a.g + h(a, end) - (b.g + h(b, end)));
      cur = open.shift();
    } else cur = open.shift();

    visited++;
    if (cur === end) break;

    for (let n of neighbors(cur)) {
      n.visited = true;
      n.parent = cur;
      n.g = cur.g + 1;
      open.push(n);
      if (n !== start && n !== end) {
        n.el.classList.add("visited");
      }
      await sleep(10);
    }
  }

  let t1 = performance.now();
  let pathLen = await drawPath();
  addResult(type, `${ROWS}x${COLS}`, (t1 - t0).toFixed(2), visited, pathLen);
}

async function drawPath() {
  let path = [];
  let cur = end.parent;

  //lưu đường đi từ End về Start vào mảng path
  while (cur && cur !== start) {
    path.push(cur);
    cur = cur.parent;
  }

  path.reverse(); //đảo ngược mảng để lấy đường từ Start đến End

  //vẽ đường đi từ Start đến End
  for (let node of path) {
    node.el.classList.add("path");
    await sleep(20); //tốc độ vẽ 20ms mỗi ô
  }

  return path.length;
}

function addResult(algo, size, time, visited, len) {
  let tr = document.createElement("tr");
  tr.innerHTML = `<td>${algo}</td>
     <td>${size}</td>
     <td>${time}</td>
     <td>${visited}</td>
     <td>${len}</td>`;
  table.appendChild(tr);
}

function resetAll() {
  table.innerHTML = "";
  document
    .querySelectorAll("button.active")
    .forEach((b) => b.classList.remove("active"));

  mode = null;
  createMaze();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

createMaze();
