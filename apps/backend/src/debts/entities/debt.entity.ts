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
import { DebtStatus } from '../enums/debt-status.enum';
import { DebtType } from '../enums/debt-type.enum';
import { DebtPriority } from '../enums/debt-priority.enum';
import { Contact } from 'src/contacts/entities/contact.entity';
import { DirectionEnum } from '../enums/debt-user-type.enum';

@Entity('debts')
@Unique(['name', 'profile'])
export class Debt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'contact_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  contactName: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: DirectionEnum,
    default: DirectionEnum.RECEIVABLE,
  })
  direction: DirectionEnum;

  @Column({
    name: 'debt_type',
    type: 'enum',
    enum: DebtType,
    default: DebtType.PERSONAL,
  })
  debtType: DebtType;

  @Column({ type: 'enum', enum: DebtStatus, default: DebtStatus.PENDING })
  status: DebtStatus;

  @Column({ type: 'enum', enum: DebtPriority, default: DebtPriority.MEDIUM })
  priority: DebtPriority;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl?: string;

  @Column({
    name: 'interest_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  interestRate?: number;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'paid_at', type: 'timestamp with time zone', nullable: true })
  paidAt?: Date;

  @ManyToOne(() => Profile, (profile) => profile.debts, { nullable: false })
  @JoinColumn({ name: 'profile_id' })
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
}
