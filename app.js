import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, child, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyDwFsfL6UEb02lIIWS2LJs4Ut-Nxh7Px3s",
authDomain: "queue-less-shopping.firebaseapp.com",
databaseURL: "https://queue-less-shopping-default-rtdb.firebaseio.com",
projectId: "queue-less-shopping",
storageBucket: "queue-less-shopping.firebasestorage.app",
messagingSenderId: "967614563802",
appId: "1:967614563802:web:b8b85fb50b05a72f00ace3",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let cart = {};

const barcodeInput = document.getElementById("barcodeInput");

barcodeInput.addEventListener("keypress", async function(e){

if(e.key === "Enter"){

const barcode = barcodeInput.value.trim();

barcodeInput.value = "";

const snapshot = await get(child(ref(db), "products/" + barcode));

if(snapshot.exists()){

const product = snapshot.val();

if(cart[barcode]){

cart[barcode].qty += 1;

}else{

cart[barcode] = {
name: product.name,
price: product.price,
qty: 1
};

}

renderCart();

}else{

alert("Product not found");

}

}

});

function renderCart(){

const table = document.getElementById("cartTable");

table.innerHTML = "";

let total = 0;

for(let id in cart){

const item = cart[id];

const itemTotal = item.price * item.qty;

total += itemTotal;

table.innerHTML += `
<tr>
<td>${item.name}</td>
<td>${item.price}</td>

<td>
<button onclick="decreaseQty('${id}')">-</button>
${item.qty}
<button onclick="increaseQty('${id}')">+</button>
</td>

<td>${itemTotal}</td>

<td>
<button onclick="removeItem('${id}')">X</button>
</td>

</tr>
`;

}

document.getElementById("totalAmount").innerText = total;

}

window.increaseQty = function(id){

cart[id].qty += 1;

renderCart();

}

window.decreaseQty = function(id){

if(cart[id].qty > 1){

cart[id].qty -= 1;

}else{

delete cart[id];

}

renderCart();

}

window.removeItem = function(id){

delete cart[id];

renderCart();

}

window.generateReceipt = async function(){

const phone = document.getElementById("phone").value;

if(phone === ""){
alert("Enter phone number");
return;
}

const orderId = "order_" + Date.now();

let total = 0;

let items = {};

for(let id in cart){

items[id] = cart[id];

total += cart[id].price * cart[id].qty;

}

await set(ref(db,"orders/" + orderId),{

phone: phone,
items: items,
total: total,
time: new Date().toString()

});

alert("Receipt Generated!");

cart = {};

renderCart();

document.getElementById("phone").value = "";

}