# `app/utils/decrypt-upload.js` — AES Decryption Utility

## Purpose

Utility function to decrypt AES-encrypted file content (typically onboarding flow data) using CryptoJS.

## Key Code

```js
import CryptoJS from "crypto-js";

export function decryptEncryptedFile(fileContent, secretKey) {
    const decryptedBytes = CryptoJS.AES.decrypt(fileContent, secretKey);
    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
        throw new Error("Invalid or corrupted encryption format");
    }
    return JSON.parse(decrypted);
}
```

## Explanation

- Uses AES decryption with the provided secret key.
- Returns parsed JSON object from the decrypted string.
- Throws if decryption fails (corrupted data or wrong key).
- Used for importing previously exported encrypted onboarding flow files.
