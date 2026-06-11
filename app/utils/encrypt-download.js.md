# `app/utils/encrypt-download.js` — AES Encryption & Download Utility

## Purpose

Utility functions to encrypt data and download it as a `.jhrmsenc` file.

## Key Code

```js
import CryptoJS from "crypto-js";

export function encryptData(data, secretKey) {
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, secretKey).toString();
}

export function downloadEncrypted(data, secretKey, fileName = "onboarding-flow") {
    const encrypted = encryptData(data, secretKey);
    const blob = new Blob([encrypted], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.jhrmsenc`;
    a.click();
    window.URL.revokeObjectURL(url);
}
```

## Explanation

- `encryptData`: Serializes data to JSON and encrypts with AES.
- `downloadEncrypted`: Creates a Blob from encrypted data, triggers browser download with `.jhrmsenc` extension.
- Used for exporting onboarding flow configurations securely.
- Encryption key comes from runtime config (`encSecret`).
