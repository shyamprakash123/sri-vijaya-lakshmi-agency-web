import CryptoJS from "crypto-js";

export function encryptOrderInfo({ order_id, user_id, amount }: {
  order_id: string;
  user_id: string;
  amount: number;
}) {
  const rawData = JSON.stringify({ order_id, user_id });
  const key = CryptoJS.SHA256(amount.toString()).toString().slice(0, 32); // 256-bit key
  const encrypted = CryptoJS.AES.encrypt(rawData, key).toString();
  const base64 = btoa(encrypted); // encode to base64
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // base64url
}
