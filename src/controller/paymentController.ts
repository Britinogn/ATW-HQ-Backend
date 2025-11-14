import { Request, Response } from 'express';
import { Paystack } from 'paystack-sdk';
import { 
    IPaymentInitialize, 
    IPaymentInitializeResponse, 
    IPaymentVerifyResponse, 
    PaystackError 
} from '../types';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

// Initialize Payment
export const initializePayment = async (
    req: Request<{}, {}, IPaymentInitialize>, 
    res: Response<IPaymentInitializeResponse | PaystackError>
) => {
    try {
        const { email, amount, callbackUrl } = req.body;
        
        if (!email || !amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({
                status: false,
                message: 'Valid email and positive amount are required'
            });
            return;
        }

        const response = await paystack.transaction.initialize({
            email,
            amount: String(amount * 100), // Convert to string (kobo) as SDK expects
            callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/verify`
        });

        // Null check for response.data
        if (!response.data) {
            throw new Error('Invalid response from Paystack');
        }

        res.json({
            status: true,
            message: 'Payment initialized successfully',
            data: {
                authorizationUrl: response.data.authorization_url,
                accessCode: response.data.access_code,
                reference: response.data.reference
            }
        });

    } catch (error: any) {
        console.error('Payment error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Payment initialization failed'
        });
    }
};

// Verify Payment
export const verifyPayment = async (
    req: Request<{ reference: string }>, 
    res: Response<IPaymentVerifyResponse | PaystackError>
) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            res.status(400).json({
                status: false,
                message: 'Reference is required'
            });
            return;
        }

        const response = await paystack.transaction.verify(reference);

        // Null check for response.data
        if (!response.data) {
            throw new Error('Invalid response from Paystack');
        }

        const data = response.data;

        res.json({
            status: true,
            message: 'Payment verified successfully',
            data: {
                id: data.id,
                domain: data.domain,
                status: data.status as 'success' | 'failed' | 'abandoned',
                reference: data.reference,
                amount: data.amount,
                message: data.message || null,
                gateway_response: data.gateway_response,
                paid_at: data.paid_at || undefined,
                channel: data.channel,
                currency: data.currency,
                customer: {
                    email: data.customer.email,
                    ...(data.customer.first_name && { firstName: data.customer.first_name }),
                    ...(data.customer.last_name && { lastName: data.customer.last_name })
                }
            }
        });

    } catch (error: any) {
        console.error('Verification error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Payment verification failed'
        });
    }
};

// List all transactions (optional)
// List Transactions
export const listTransactions = async (req: Request, res: Response) => {
    try {
        const response = await paystack.transaction.list();

        // Null check for response.data
        if (!response.data) {
            throw new Error('Invalid response from Paystack');
        }

        res.json({
            status: true,
            message: 'Transactions fetched successfully',
            data: response.data.map((txn: any) => ({
                ...txn,
                amount: txn.amount / 100 // Convert to Naira
            }))
        });
    } catch (error: any) {
        console.error('List transactions error:', error);
        res.status(500).json({
            status: false,
            message: error.message || 'Failed to fetch transactions'
        });
    }
};

export default { 
    initializePayment, 
    verifyPayment,
    listTransactions
};