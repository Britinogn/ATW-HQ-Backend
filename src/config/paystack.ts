import { Paystack } from 'paystack-sdk';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
}

// Initialize Paystack with the secret key
const paystack = new Paystack(paystackSecretKey);

export default paystack;