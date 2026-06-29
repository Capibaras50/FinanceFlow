import { CreateUserDto } from './create-user.dto';
import { Profile } from '../entities/profile.entity';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    profile?: Profile;
}
export {};
