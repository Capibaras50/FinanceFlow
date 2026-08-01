import { Profile } from 'src/users/entities/profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ContactStatus } from '../enums/contact-status.enum';

@Entity('contacts')
@Unique(['requester', 'addressee'])
export class Contact {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Profile, { nullable: false })
  @JoinColumn({ name: 'requester_id' })
  requester: Profile;

  @ManyToOne(() => Profile, { nullable: false })
  @JoinColumn({ name: 'addressee_id' })
  addressee: Profile;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.PENDING,
  })
  status: ContactStatus;

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
}
