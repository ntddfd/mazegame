//file này để kết nối với file api.js và grid.js nhé
import { callServer } from "./api.js";
import {
  createMaze,
  resetMaze,
  setModeLocal,
  grid,
  start,
  end,
  ROWS,
  COLS,
} from "./grid.js";

const table = document.getElementById("resultTable");

/* chạy maze */
async function run(type, btn) {
  if (!start || !end) {
    alert("Cần đặt Start và End");
    return;
  }

  document
    .querySelectorAll("#algoButtons button")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  resetMaze();

  // lấy toạ độ vị trí start và end để gửi cho BE (chuyển grid thành ma trận 0-1)
  const matrix = grid.map((row) => row.map((c) => (c.wall ? 1 : 0)));
  const payload = {
    type: type,
    matrix: matrix,
    start: { r: start.r, c: start.c },
    end: { r: end.r, c: end.c },
  };

  // lấy đường đi qua API
  const data = await callServer(payload);
  if (!data) return;

  // vẽ đường đi sau khi nhận từ BE
  if (data.found) {
    // Vẽ loang (Visited)
    for (let node of data.visitedList) {
      // Không tô màu lên start/end
      if (
        (node.r !== start.r || node.c !== start.c) &&
        (node.r !== end.r || node.c !== end.c)
      ) {
        grid[node.r][node.c].el.classList.add("visited");
      }
      await sleep(ROWS * COLS > 1000 ? 5 : 10);
    }

    // Vẽ đường đi (Path)
    for (let node of data.path) {
      grid[node.r][node.c].el.classList.add("path");
      await sleep(20);
    }
    addResult(
      type,
      `${ROWS}x${COLS}`,
      data.time,
      data.visitedList.length,
      data.path.length
    );
  } else {
    alert("Không tìm thấy đường đi!");
  }
}

/* các hàm phụ */
function addResult(algo, size, time, visited, len) {
  let tr = document.createElement("tr");
  tr.innerHTML = `<td>${algo}</td><td>${size}</td><td>${time}</td><td>${visited}</td><td>${len}</td>`;
  table.appendChild(tr);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function resetAll() {
  table.innerHTML = "";
  document
    .querySelectorAll("button.active")
    .forEach((b) => b.classList.remove("active"));
  setModeLocal(null, null); // Reset mode
  createMaze();
}

/* === GÁN SỰ KIỆN (EVENT LISTENERS) === */
// Thay thế onclick trong HTML bằng code tại đây
document.addEventListener("DOMContentLoaded", () => {
  // Nút tạo và reset
  document.getElementById("createBtn").addEventListener("click", createMaze);
  document.getElementById("reset-btn").addEventListener("click", resetAll);

  // Các nút Mode (Start, End, Wall)
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setModeLocal(btn.dataset.mode, btn));
  });

  // Các nút Thuật toán (BFS, DFS...)
  document.querySelectorAll(".algo-btn").forEach((btn) => {
    btn.addEventListener("click", () => run(btn.dataset.type, btn));
  });

  // Khởi tạo lần đầu
  createMaze();
});
