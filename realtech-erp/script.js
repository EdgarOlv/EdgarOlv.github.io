const loginScreen = document.querySelector("#loginScreen");
const app = document.querySelector("#app");
const loginForm = document.querySelector("#loginForm");
const screenTitle = document.querySelector("#screenTitle");
const navItems = document.querySelectorAll(".nav-item");
const screens = document.querySelectorAll(".screen");
const latestOrders = document.querySelector("#latestOrders");
const ordersTable = document.querySelector("#ordersTable");
const orderCount = document.querySelector("#orderCount");
const orderModal = document.querySelector("#orderModal");
const flowModal = document.querySelector("#flowModal");
const orderForm = document.querySelector("#orderForm");

let nextOrderNumber = 46;

const orders = [
  { id: "PED00045", client: "Farma Vida", status: "Produção", value: "R$ 22.475,00", date: "06/07/2026" },
  { id: "PED00044", client: "Nutri Center", status: "Financeiro", value: "R$ 9.880,00", date: "06/07/2026" },
  { id: "PED00043", client: "Bio Performance", status: "Qualidade", value: "R$ 14.320,00", date: "05/07/2026" },
  { id: "PED00042", client: "Farma Vida", status: "Faturado", value: "R$ 7.610,00", date: "04/07/2026" },
  { id: "PED00041", client: "Nutri Center", status: "Despachado", value: "R$ 18.940,00", date: "03/07/2026" }
];

const titles = {
  dashboard: "Dashboard",
  produtos: "Produtos",
  formulas: "Fórmulas",
  pedidos: "Pedidos",
  "abrir-pedido": "Abrir Pedido",
  ordens: "Ordem de Produção",
  estoque: "Estoque",
  qualidade: "Qualidade",
  relatorios: "Relatórios",
  perfil: "Perfil",
  configuracoes: "Configurações",
  clientes: "Clientes"
};

function statusClass(status) {
  if (["Faturado", "Despachado"].includes(status)) return "ok";
  if (status === "Financeiro") return "warn";
  return "info";
}

function renderOrders() {
  const rows = orders.map(order => `
    <tr>
      <td><button class="link-btn open-order">${order.id}</button></td>
      <td>${order.client}</td>
      <td><span class="status ${statusClass(order.status)}">${order.status}</span></td>
      <td>${order.value}</td>
      <td>${order.date}</td>
    </tr>
  `).join("");

  latestOrders.innerHTML = rows;
  ordersTable.innerHTML = rows;
  orderCount.textContent = `${orders.length} registros`;

  document.querySelectorAll(".open-order").forEach(button => {
    button.addEventListener("click", () => showScreen("abrir-pedido"));
  });
}

function showScreen(screenId) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === screenId));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.screen === screenId));
  screenTitle.textContent = titles[screenId] || "Dashboard";
}

function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  const user = document.querySelector("#username").value.trim();
  const pass = document.querySelector("#password").value.trim();

  if (user === "admin" && pass === "123") {
    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");
    renderOrders();
    return;
  }

  alert("Use o usuário admin e a senha 123 para acessar o protótipo.");
});

navItems.forEach(item => {
  item.addEventListener("click", () => showScreen(item.dataset.screen));
});

document.querySelector("#newOrderBtn").addEventListener("click", () => openModal(orderModal));
document.querySelector("#flowBtn").addEventListener("click", () => openModal(flowModal));

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(document.querySelector(`#${button.dataset.close}`)));
});

[orderModal, flowModal].forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal);
  });
});

orderForm.addEventListener("submit", event => {
  event.preventDefault();
  const client = document.querySelector("#orderClient").value;
  const product = document.querySelector("#orderProduct").value;
  const qty = Number(document.querySelector("#orderQty").value);
  const unitPrice = product === "Nutri Plus" ? 89.9 : product === "Energy Mix" ? 74.5 : 62.2;
  const value = qty * unitPrice;

  orders.unshift({
    id: `PED${String(nextOrderNumber).padStart(5, "0")}`,
    client,
    status: "Financeiro",
    value: value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    date: "06/07/2026"
  });

  nextOrderNumber += 1;
  renderOrders();
  closeModal(orderModal);
  showScreen("dashboard");
});

renderOrders();
