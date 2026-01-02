//khai báo biến
export let ROWS = 20;
export let COLS = 20;
export let grid = [];
export let start = null;
export let end = null;
let mode = null; //biến nội bộ nên không cần export
let isMouseDown = false; //biến nhấn chuột hay không
let isAddWall = false; //biến vẽ hoặc xoá tường

const maze = document.getElementById("maze");
document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

/* xử lý Maze*/
export function setRowsCols(r, c) {
  ROWS = r;
  COLS = c;
}

export function createMaze() {
  // Lấy giá trị từ input
  const rowsInput = document.getElementById("rows");
  const colsInput = document.getElementById("cols");
  if (rowsInput) ROWS = +rowsInput.value;
  if (colsInput) COLS = +colsInput.value;

  grid = [];
  start = end = null;
  maze.innerHTML = ""; //hiển thị maze ban đầu rỗng

  //kích thước ô
  const wrapper = document.querySelector(".maze-wrapper");
  const maxWidth = wrapper.clientWidth - 40; //trừ padding 40
  const maxHeight = wrapper.clientHeight - 40;

  // kích thước ô tối ưu, lấy giá trị nhỏ nhất giữa (chiều rộng/số cột) và (chiều cao/số hàng)
  let cellSize = Math.floor(Math.min(maxWidth / COLS, maxHeight / ROWS));

  cellSize = Math.max(5, Math.min(cellSize, 25)); // giới hạn kích thước tối đa là 25px để map nhỏ không bị quá to,tối thiểu là 5px để vẫn nhìn thấy được

  maze.style.gridTemplateRows = `repeat(${ROWS}, ${cellSize}px)`;
  maze.style.gridTemplateColumns = `repeat(${COLS}, ${cellSize}px)`;

  // không cho bôi đen khi kéo chuột
  maze.style.userSelect = "none";

  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      let el = document.createElement("div");
      el.className = "cell";
      el.addEventListener("mousedown", (e) => handleMouseDown(r, c, e));
      el.addEventListener("mouseenter", () => handleMouseEnter(r, c));
      maze.appendChild(el);
      row.push({ r, c, wall: false, el });
    }
    grid.push(row);
  }
}

// Hàm xử lý khi nhấn chuột xuống
function handleMouseDown(r, c, e) {
  if (!mode) {
    alert("Vui lòng chọn chức năng!");
    return;
  }
  e.preventDefault(); // không cho trình duyệt kéo ảnh div

  if (mode === "start" || mode === "end") {
    clickCell(r, c);
    return;
  }

  if (mode === "wall") {
    isMouseDown = true;
    let cell = grid[r][c];

    // Nếu bấm vào ô trống -> Chế độ vẽ (isAddWall = true)
    // Nếu bấm vào ô tường -> Chế độ xóa (isAddWall = false)
    isAddWall = !cell.wall;

    updateWall(cell);
  }
}

// hàm xử lý khi di chuột sang ô khác
function handleMouseEnter(r, c) {
  if (isMouseDown && mode === "wall") {
    let cell = grid[r][c];
    updateWall(cell);
  }
}

// Hàm cập nhật tường dựa trên trạng thái isAddWall
function updateWall(cell) {
  if (cell === start || cell === end) return; // không vẽ đè lên Start/End

  cell.wall = isAddWall;
  if (isAddWall) {
    cell.el.classList.add("wall");
  } else {
    cell.el.classList.remove("wall");
  }
}

function clickCell(r, c) {
  if (!mode) {
    alert("Vui lòng chọn chức năng!");
    return; //nếu chưa chọn chế độ thì thoát hàm
  }

  let cell = grid[r][c];
  //không đặt tường trùng với điểm start/end
  if (mode === "wall") {
    if (cell === start || cell === end) return;
    cell.wall = !cell.wall;
    cell.el.classList.toggle("wall");
  } else if (mode === "start") {
    if (cell.wall) {
      cell.wall = false;
      cell.el.classList.remove("wall");
    }
    // Cập nhật biến start được export
    if (start) start.el.classList.remove("start");
    start = cell;
    cell.el.classList.add("start");
  } else if (mode === "end") {
    if (cell.wall) {
      cell.wall = false;
      cell.el.classList.remove("wall");
    }
    // Cập nhật biến end được export
    if (end) end.el.classList.remove("end");
    end = cell;
    cell.el.classList.add("end");
  }
}

export function resetMaze() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].el.classList.remove("visited", "path");
    }
  }
}

// Hàm hỗ trợ setMode từ main.js
export function setModeLocal(m, btn) {
  mode = m;
  // Xóa active cũ
  document
    .querySelectorAll("#drawModes button")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}
