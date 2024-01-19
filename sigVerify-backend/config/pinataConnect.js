import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';

dotenv.config();

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_KEY });

export { pinata };
