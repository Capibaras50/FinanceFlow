import { Profile } from "../../users/entities/profile.entity";
export declare class Message {
    id: number;
    role: string;
    message: string;
    profile: Profile;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
