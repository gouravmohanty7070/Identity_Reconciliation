import Contact from '../models/contact';
import {Op} from "sequelize";

interface ContactData {
    email?: string;
    phoneNumber?: string;
}

interface ReconciliationResult {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export const reconcileContacts = async ({ email, phoneNumber }: ContactData): Promise<ReconciliationResult> => {
    const contacts = await Contact.findAll({
        where: {
            deletedAt: null,
            [Op.or]: [
                { email },
                { phoneNumber },
            ],
        },
    });

    let primaryContact: Contact | null = null;
    const secondaryContacts: Contact[] = [];

    contacts.forEach(contact => {
        if (contact.linkPrecedence === 'primary') {
            if (!primaryContact || contact.createdAt < primaryContact.createdAt) {
                primaryContact = contact;
            }
        } else {
            secondaryContacts.push(contact);
        }
    });

    if (!primaryContact) {
        primaryContact = await Contact.create({
            email,
            phoneNumber,
            linkPrecedence: 'primary',
        });
    } else if (email !== primaryContact['email'] || phoneNumber !== primaryContact['phoneNumber']) {
        const secondaryContact = await Contact.create({
            email,
            phoneNumber,
            linkedId: primaryContact['id'],
            linkPrecedence: 'secondary',
        });
        secondaryContacts.push(secondaryContact);
    }

    const allEmails = new Set<string>([primaryContact.email!, ...secondaryContacts.map(c => c.email!).filter(e => e)]);
    const allPhoneNumbers = new Set<string>([primaryContact.phoneNumber!, ...secondaryContacts.map(c => c.phoneNumber!).filter(p => p)]);
    const allSecondaryContactIds = secondaryContacts.map(c => c.id);

    return {
        primaryContactId: primaryContact.id,
        emails: Array.from(allEmails),
        phoneNumbers: Array.from(allPhoneNumbers),
        secondaryContactIds: allSecondaryContactIds,
    };
};
