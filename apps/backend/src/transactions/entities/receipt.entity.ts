import { Profile } from 'src/users/entities/profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReceiptStatus } from '../enums/receipt.enums';
import { Expense } from './expense.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Profile, (profile) => profile.receipts)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'text', name: 'file_url', nullable: false })
  fileUrl: string;

  @Column({ type: 'text', name: 'file_name', nullable: true })
  fileName: string;

  @Column({ type: 'integer', name: 'file_size_bytes', nullable: true })
  fileSizeBytes: number;

  @Column({ type: 'text', name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({
    type: 'enum',
    nullable: false,
    default: 'pending',
    enum: ReceiptStatus,
  })
  status: ReceiptStatus;

  @Column({ type: 'text', nullable: true, name: 'job_id' })
  jobId: string;

  @Column({ type: 'smallint', nullable: false, default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true, name: 'last_error' })
  lastError: string;

  @Column({ type: 'integer', nullable: true, name: 'extraction_confidence' })
  extractionConfidence: number;

  @OneToOne(() => Expense, (expense) => expense.receipt, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'expense_id', referencedColumnName: 'id' })
  expense: Expense;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'processed_at',
    nullable: true,
  })
  processedAt: Date;
}
