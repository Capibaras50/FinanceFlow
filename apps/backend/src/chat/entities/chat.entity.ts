import { Profile } from 'src/users/entities/profile.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEnum } from '../enums/role.enum';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: RoleEnum, nullable: false })
  role: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @ManyToOne(() => Profile, (profile) => profile.id, { nullable: false })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: Profile;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date;
}
