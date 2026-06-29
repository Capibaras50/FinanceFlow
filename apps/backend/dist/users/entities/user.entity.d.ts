import { Profile } from './profile.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    profile: Profile;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    hashPassword(): Promise<void>;
}
