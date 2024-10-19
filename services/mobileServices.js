const https = require('https');

exports.sendMobileOTP = (recipient, otpCode) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender_id: 'FSTSMS',
      message: `Your OTP is: ${otpCode}`,
      language: 'english',
      route: 'p',
      numbers: recipient
    });

    const options = {
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': '2m8LKxbrqdQi5ejAZfRvhJPkwMl3BNH4GIESV6sFT0uCYOaWptS2Ju6bT8HjzOlmBk5KZfR4cG1ws7AW',  // Replace with Fast2SMS API key
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, res => {
      let response = '';

      res.on('data', chunk => {
        response += chunk;
      });

      res.on('end', () => {
        console.log('OTP sent response from Fast2SMS:', response);
        resolve(JSON.parse(response));
      });
    });

    req.on('error', error => {
      console.error('Error sending OTP with Fast2SMS:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};
