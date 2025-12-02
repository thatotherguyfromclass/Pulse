// src/services/firestoreService.js
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp, increment, addDoc, writeBatch } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

// -------------------- CUSTOMERS --------------------
export const getCustomers = async (userId) => {
  const ref = collection(db, "users", userId, "customers");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addCustomer = async (userId, data) => {
  // 1️⃣ Get user subscription + counts
  const userSnap = await getDoc(doc(db, "users", userId));
  const user = userSnap.data();

  if (user.subscriptionStatus === "free" && user.totalCustomers >= 10) {
    throw new Error("Free plan limit reached. Upgrade to add more customers.");
  }

  // 2️⃣ Continue with add
  const ref = collection(db, "users", userId, "customers");
  const customer = {
    name: data.name,
    whatsapp: data.whatsapp,
    notes: data.notes || "",
    totalOrders: 0,
    totalSpent: 0,
    createdAt: serverTimestamp()
  };
  const docRef = await addDoc(ref, customer);

  // increment totalCustomers
  await updateDoc(doc(db, "users", userId), {
    totalCustomers: increment(1)
  });

  return docRef.id;
};

// -------------------- DELETE CUSTOMER --------------------
export const deleteCustomer = async (userId, customerId) => {
  const userRef = doc(db, "users", userId);

  // 1️⃣ Get all orders of this customer
  const ordersRef = collection(db, "users", userId, "orders");
  const snapshot = await getDocs(ordersRef);
  const customerOrders = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(order => order.customerId === customerId);

  // 2️⃣ Calculate totals to remove
  let totalOrdersToRemove = customerOrders.length;
  let totalSalesToRemove = customerOrders.reduce(
    (sum, order) => sum + (order.status === "Paid" ? Number(order.price) : 0),
    0
  );

  // 3️⃣ Start batch
  const batch = writeBatch(db);

  // Delete all orders
  customerOrders.forEach(order => {
    const orderRef = doc(db, "users", userId, "orders", order.id);
    batch.delete(orderRef);
  });

  // Delete the customer
  const customerRef = doc(db, "users", userId, "customers", customerId);
  batch.delete(customerRef);

  // Update totals
  batch.update(userRef, {
    totalOrders: increment(-totalOrdersToRemove),
    totalSales: increment(-totalSalesToRemove),
    totalCustomers: increment(-1),
  });

  // 4️⃣ Commit batch
  await batch.commit();
};

// -------------------- DELETE USER ACCOUNT --------------------
export const deleteUserAccount = async (uid) => {
  const batch = writeBatch(db);

  // Delete all subcollections
  const subcollections = ["customers", "orders"];
  for (const sub of subcollections) {
    const ref = collection(db, "users", uid, sub);
    const snap = await getDocs(ref);
    for (const docItem of snap.docs) {
      const docRef = doc(db, "users", uid, sub, docItem.id);
      batch.delete(docRef);
    }
  }

  // Delete user document
  const userRef = doc(db, "users", uid);
  batch.delete(userRef);

  // Commit batch
  await batch.commit();

  // Delete Firebase Auth user
  await deleteUser(auth.currentUser);

  window.location.href = "/signup";
};

// -------------------- ORDERS --------------------
export const getOrders = async (userId) => {
  const ref = collection(db, "users", userId, "orders");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addOrder = async (userId, data) => {
  // 1️⃣ Check limits
  const userSnap = await getDoc(doc(db, "users", userId));
  const user = userSnap.data();

  if (user.subscriptionStatus === "free" && user.totalOrders >= 10) {
    throw new Error("Free plan limit reached. Upgrade to add more orders.");
  }

  // 2️⃣ Continue with order creation
  const ref = collection(db, "users", userId, "orders");

  const order = {
    customerId: data.customerId,
    product: data.product,
    price: Number(data.price),
    status: data.status,
    date: data.date ? data.date : serverTimestamp(),
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(ref, order);

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { totalOrders: increment(1) });

  if (data.status === "Paid") {
    await updateDoc(userRef, { totalSales: increment(Number(data.price)) });
  }

  const customerRef = doc(db, "users", userId, "customers", data.customerId);
  await updateDoc(customerRef, {
    totalOrders: increment(1),
    totalSpent: data.status === "Paid" ? increment(Number(data.price)) : increment(0)
  });

  return docRef.id;
};

export const deleteOrder = async (userId, order) => {
  // order: { id, price, status, customerId }
  const ref = doc(db, "users", userId, "orders", order.id);
  await deleteDoc(ref);

  const userRef = doc(db, "users", userId);
  // Decrement totalOrders
  await updateDoc(userRef, { totalOrders: increment(-1) });

  // Decrement totalSales if status === "Paid"
  if (order.status === "Paid") {
    await updateDoc(userRef, { totalSales: increment(-Number(order.price)) });
  }

  // Update customer's totals
  const customerRef = doc(db, "users", userId, "customers", order.customerId);
  await updateDoc(customerRef, {
    totalOrders: increment(-1),
    totalSpent: order.status === "Paid" ? increment(-Number(order.price)) : increment(0)
  });
};

export const updateOrder = async (userId, orderId, oldOrder, newData) => {
  // oldOrder = { id, price, status, customerId }
  const ref = doc(db, "users", userId, "orders", orderId);

  const oldPrice = Number(oldOrder.price);
  const newPrice = Number(newData.price);

  // Update the order document
  await updateDoc(ref, {
    product: newData.product,
    price: newPrice,
    status: newData.status,
    customerId: newData.customerId,
    date: newData.date ? newData.date : oldOrder.date
  });

  const userRef = doc(db, "users", userId);

  // Only adjust totalSales if status changed
  if (oldOrder.status !== "Paid" && newData.status === "Paid") {
    await updateDoc(userRef, { totalSales: increment(newPrice) });
    const customerRef = doc(db, "users", userId, "customers", newData.customerId);
    await updateDoc(customerRef, { totalSpent: increment(newPrice) });
  } else if (oldOrder.status === "Paid" && newData.status !== "Paid") {
    await updateDoc(userRef, { totalSales: increment(-oldPrice) });
    const customerRef = doc(db, "users", userId, "customers", oldOrder.customerId);
    await updateDoc(customerRef, { totalSpent: increment(-oldPrice) });
  } else if (oldOrder.status === "Paid" && newData.status === "Paid") {
    // Price changed while still Paid → adjust totalSales and customer totalSpent
    await updateDoc(userRef, { totalSales: increment(newPrice - oldPrice) });
    const customerRef = doc(db, "users", userId, "customers", newData.customerId);
    await updateDoc(customerRef, { totalSpent: increment(newPrice - oldPrice) });
  }

  // If the customer changed, only move totalSpent if status is Paid
  if (oldOrder.customerId !== newData.customerId) {
    if (oldOrder.status === "Paid") {
      const oldCustomerRef = doc(db, "users", userId, "customers", oldOrder.customerId);
      await updateDoc(oldCustomerRef, { totalSpent: increment(-oldPrice) });
    }
    if (newData.status === "Paid") {
      const newCustomerRef = doc(db, "users", userId, "customers", newData.customerId);
      await updateDoc(newCustomerRef, { totalSpent: increment(newPrice) });
    }
  }
};

/** GET USER DATA **/
export const getUserData = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data();
};

/** UPDATE USER DATA **/
export const updateUserData = async (uid, updates) => {
  return await updateDoc(doc(db, "users", uid), updates);
};
