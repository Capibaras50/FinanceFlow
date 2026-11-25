import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Profile } from './profile.entity';
import { RefreshToken } from 'src/auth/entities/refresh-tokens.entity';
import { UserRoleEnum } from '../enums/role.enum';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID of user',
    example: 1,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: 'Email of user',
    example: 'example@example.com',
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string;

  @ApiProperty({
    description: 'Profile of user',
    type: () => Profile,
  })
  @OneToOne(() => Profile, (profile) => profile.user, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: Profile;

  @ApiProperty({
    description: 'role of user',
    enum: UserRoleEnum,
    example: UserRoleEnum.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    nullable: false,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  @ApiHideProperty()
  @Exclude()
  @Column({ name: 'recovery_token_hash', type: 'text', nullable: true })
  recoveryTokenHash: string | null;

  @ApiProperty({
    description: 'refresh token of user',
    type: () => [RefreshToken],
  })
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    onDelete: 'CASCADE',
  })
  refreshToken: RefreshToken[];

  @ApiHideProperty()
  @Exclude()
  @Column({
    name: 'recovery_token_expires_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  recoveryTokenExpiresAt: Date | null;

  @ApiProperty({
    description: 'date when the user was created',
    example: new Date(),
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'date when the user was updated',
    example: new Date(),
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'date when the user was deleted',
    example: new Date(),
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await hash(this.password, 10);
    }
  }
}
