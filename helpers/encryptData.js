const crypto = require("crypto");
require("dotenv").config();

const secret_key = process.env.secret_key;
const secret_iv = process.env.secret_iv;
const encryptionMethod = process.env.encryptionMethod;
const hashMethod = process.env.hashMethod;

const key = crypto
  .createHash(hashMethod)
  .update(secret_key, "utf-8")
  .digest("hex")
  .substr(0, 32);

const iv = crypto
  .createHash(hashMethod)
  .update(secret_iv, "utf-8")
  .digest("hex")
  .substr(0, 16);
// console.log({ivv});

const encryptData = (data) => {
  const encryptor = crypto.createCipheriv(encryptionMethod, key, iv);
  const aes_encrypted =
    encryptor.update(data, "utf8", "base64") + encryptor.final("base64");
  return Buffer.from(aes_encrypted).toString("base64");
};

module.exports = encryptData;
