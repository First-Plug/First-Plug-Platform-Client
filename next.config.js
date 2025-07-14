/** @type {import('next').NextConfig} */

// const fs = require('fs');
// const path = require('path');

module.exports = () => {
  // if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "production") {
  //   console.error("ERROR: Invalid NODE_ENV value.");
  //   process.exit(1);
  // }
  // const envFile = path.resolve(process.cwd(), '.env');

  // if (!fs.existsSync(envFile)) {
  //   console.error('ERROR: The .env file does not exist. Copy the .env.example file and fill in the necessary environment variables.');
  //   process.exit(1);
  // }

  // const requiredEnvVariables = ['NEXT_PUBLIC_API_URL_DEV', 'NEXT_PUBLIC_API_URL_PROD', 'NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  // const missingVariables = requiredEnvVariables.filter((key) => !process.env[key]);

  // if (missingVariables.length > 0) {
  //   console.error(`ERROR: The following environment variables are missing: ${missingVariables.join(', ')}`);
  //   process.exit(1);
  // }

  const nextConfig = {
    images: {
      domains: [
        "lh3.googleusercontent.com",
        "loremflickr.com",
        "picsum.photos",
        "cloudflare-ipfs.com",
        "avatars.githubusercontent.com",
        "example.com",
        "flagcdn.com",
      ],
    },
  };

  return nextConfig;
};
