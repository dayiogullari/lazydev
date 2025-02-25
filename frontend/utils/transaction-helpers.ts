import { toHex } from "@cosmjs/encoding";

const generateSecret = (): string => {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return toHex(randomBytes);
};

export default generateSecret;
