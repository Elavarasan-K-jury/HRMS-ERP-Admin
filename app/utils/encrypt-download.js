import CryptoJS from "crypto-js";

/**
 * Encrypt data & return encrypted string
 */
export function encryptData(data, secretKey) {
    const json = JSON.stringify(data);

    // AES Encryption
    const encrypted = CryptoJS.AES.encrypt(json, secretKey).toString();
    return encrypted;
}

/**
 * Download encrypted data as a custom file
 */
export function downloadEncrypted(data, secretKey, fileName = "onboarding-flow") {
    console.log('encrypt-download.js @ Line 18:', data, secretKey, fileName);
    const encrypted = encryptData(data, secretKey);

    const blob = new Blob([encrypted], {
        type: "application/octet-stream"
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.jhrmsenc`; // custom extension
    a.click();

    window.URL.revokeObjectURL(url);
}
