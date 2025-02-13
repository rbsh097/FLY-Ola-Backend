// Backend/config/phonepeConfig.js
const fs = require('fs');
require('dotenv').config();

function getPhonePeConfig() {
  const env = process.env.PHONEPE_ENV || 'test';

  if (env === 'production') {
    // Production credentials
    const merchantId = process.env.PHONEPE_PROD_MERCHANT_ID;
    const apiKeyIndex = process.env.PHONEPE_PROD_API_KEY_INDEX;
    const hostUrl = process.env.PHONEPE_PROD_HOST;

    let apiKeyValue = '';
    // Option A: read from file
    const apiKeyFilePath = process.env.PHONEPE_PROD_API_KEY_FILE;
    if (apiKeyFilePath && fs.existsSync(apiKeyFilePath)) {
      // The JSON might contain { "key": "..." } or something similar
      const fileData = JSON.parse(fs.readFileSync(apiKeyFilePath, 'utf8'));
      apiKeyValue = fileData.key || '';
    }

    // Option B: or from an env variable (if you have it directly)
    if (process.env.PHONEPE_PROD_API_KEY) {
      apiKeyValue = process.env.PHONEPE_PROD_API_KEY;
    }

    return {
      merchantId,
      apiKeyValue,
      apiKeyIndex,
      hostUrl
    };
  } else {
    // Test credentials
    const merchantId = process.env.PHONEPE_TEST_MERCHANT_ID;
    const apiKeyValue = process.env.PHONEPE_TEST_API_KEY;
    const apiKeyIndex = process.env.PHONEPE_TEST_API_KEY_INDEX;
    const hostUrl = process.env.PHONEPE_TEST_HOST;

    return {
      merchantId,
      apiKeyValue,
      apiKeyIndex,
      hostUrl
    };
  }
}

module.exports = getPhonePeConfig;
