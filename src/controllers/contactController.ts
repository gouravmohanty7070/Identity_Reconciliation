import { Request, Response } from 'express';
import { reconcileContacts } from '../services/contactService';

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await reconcileContacts({ email, phoneNumber });
        res.status(200).json({ contact: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
