import { Category } from 'src/categories/entities/category.entity';
import { Profile } from 'src/users/entities/profile.entity';
import { Wallet } from 'src/wallets/entities/wallets.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', nullable: false, precision: 12, scale: 2 })
  value: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.expenses)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToMany(() => Category, (category) => category.expenses)
  @JoinTable({
    name: 'expense_categories',
    joinColumn: { name: 'expense_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToOne(() => Profile, (profile) => profile.expenses)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  // Receipt

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
