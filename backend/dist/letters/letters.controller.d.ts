import { LettersService } from './letters.service';
import { Response } from 'express';
export declare class LettersController {
    private lettersService;
    constructor(lettersService: LettersService);
    getDashboardStats(search?: string, status?: string, issuer?: string): Promise<{
        stats: {
            totalLetters: number;
            activeLetters: number;
            expiredLetters: number;
            authorizedIssuers: number;
        };
        issuers: string[];
        letters: ({
            issuedBy: {
                id: string;
                username: string;
                role: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            accountNumber: string;
            bankName: string;
            issueDate: Date;
            expiryDate: Date;
            pdfPath: string | null;
            qrCodeData: string | null;
            status: string;
            issuedById: string;
        })[];
    }>;
    generateLetter(req: any, body: {
        bankName?: string;
        accountNumber: string;
        issueDate: string;
        expiryDate: string;
    }, file?: any): Promise<{
        issuedBy: {
            id: string;
            username: string;
            role: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        accountNumber: string;
        bankName: string;
        issueDate: Date;
        expiryDate: Date;
        pdfPath: string | null;
        qrCodeData: string | null;
        status: string;
        issuedById: string;
    }>;
    verifyPublicLetter(id: string, accountNumber?: string): Promise<{
        requiresAccountNumber: boolean;
        bankName: string;
        message: string;
        isAccountMatch?: undefined;
        isValid?: undefined;
        id?: undefined;
        accountNumber?: undefined;
        issueDate?: undefined;
        expiryDate?: undefined;
        status?: undefined;
        issuedBy?: undefined;
    } | {
        requiresAccountNumber: boolean;
        isAccountMatch: boolean;
        isValid: boolean;
        message: string;
        bankName?: undefined;
        id?: undefined;
        accountNumber?: undefined;
        issueDate?: undefined;
        expiryDate?: undefined;
        status?: undefined;
        issuedBy?: undefined;
    } | {
        requiresAccountNumber: boolean;
        isAccountMatch: boolean;
        id: string;
        bankName: string;
        accountNumber: string;
        issueDate: Date;
        expiryDate: Date;
        status: string;
        isValid: boolean;
        issuedBy: string;
        message?: undefined;
    }>;
    verifyPublicLetterPost(id: string, body: {
        accountNumber?: string;
    }): Promise<{
        requiresAccountNumber: boolean;
        bankName: string;
        message: string;
        isAccountMatch?: undefined;
        isValid?: undefined;
        id?: undefined;
        accountNumber?: undefined;
        issueDate?: undefined;
        expiryDate?: undefined;
        status?: undefined;
        issuedBy?: undefined;
    } | {
        requiresAccountNumber: boolean;
        isAccountMatch: boolean;
        isValid: boolean;
        message: string;
        bankName?: undefined;
        id?: undefined;
        accountNumber?: undefined;
        issueDate?: undefined;
        expiryDate?: undefined;
        status?: undefined;
        issuedBy?: undefined;
    } | {
        requiresAccountNumber: boolean;
        isAccountMatch: boolean;
        id: string;
        bankName: string;
        accountNumber: string;
        issueDate: Date;
        expiryDate: Date;
        status: string;
        isValid: boolean;
        issuedBy: string;
        message?: undefined;
    }>;
    downloadPdf(id: string, res: Response): Promise<void>;
}
