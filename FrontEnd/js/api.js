// Hàm gọi API (Fetch)
export async function callServer(payload) {
  try {
    const response = await fetch("http://localhost:3000/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    alert("Không kết nối được với Server Backend!");
    return null;
  }
}
