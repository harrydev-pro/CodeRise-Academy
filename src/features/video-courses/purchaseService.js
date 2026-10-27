import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

function getAllPurchases() {
  const purchases = readStore(STORAGE_KEYS.purchases, []);

  return Array.isArray(purchases) ? purchases : [];
}

export function getPurchasesByUser(userId) {
  return getAllPurchases().filter(
    (purchase) => purchase.userId === userId
  );
}

export function getAllPurchaseRecords() {
  return getAllPurchases();
}

export function getPurchaseById(purchaseId) {
  return getAllPurchases().find(
    (purchase) => purchase.id === purchaseId
  ) || null;
}

export function createPurchase(purchaseData) {
  const purchases = getAllPurchases();

  const existingPurchase = purchases.find(
    (purchase) =>
      purchase.userId === purchaseData.userId &&
      purchase.courseId === purchaseData.courseId &&
      purchase.status === "completed"
  );

  if (existingPurchase) {
    return existingPurchase;
  }

  const purchase = {
    ...purchaseData,
    id: `purchase-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  writeStore(STORAGE_KEYS.purchases, [...purchases, purchase]);

  return purchase;
}

export function hasPurchasedCourse(userId, courseId) {
  if (!userId || !courseId) return false;

  return getAllPurchases().some(
    (purchase) =>
      purchase.userId === userId &&
      purchase.courseId === courseId &&
      purchase.status === "completed"
  );
}

export function updatePurchaseStatus(purchaseId, status) {
  const purchases = getAllPurchases();

  let updatedPurchase = null;

  const updatedPurchases = purchases.map((purchase) => {
    if (purchase.id !== purchaseId) return purchase;

    updatedPurchase = {
      ...purchase,
      status,
      updatedAt: new Date().toISOString(),
    };

    return updatedPurchase;
  });

  if (updatedPurchase) {
    writeStore(STORAGE_KEYS.purchases, updatedPurchases);
  }

  return updatedPurchase;
}