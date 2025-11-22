import CryptoJS from "crypto-js";

/**
 * Decrypt encrypted file content
 */
export function decryptEncryptedFile(fileContent, secretKey) {
    const decryptedBytes = CryptoJS.AES.decrypt(fileContent, secretKey);
    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error("Invalid or corrupted encryption format");
    }

    return JSON.parse(decrypted);
}
