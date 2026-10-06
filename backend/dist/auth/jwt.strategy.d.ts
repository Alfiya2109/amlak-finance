import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: string;
        username: string;
        role: string;
    }): Promise<{
        id: string;
        username: string;
        role: string;
    }>;
}
export {};
