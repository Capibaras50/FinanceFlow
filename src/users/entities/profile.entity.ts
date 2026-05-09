import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Expense } from 'src/transactions/entities/expense.entity';
import { Earning } from 'src/transactions/entities/earning.entity';
import { Wallet } from 'src/wallets/entities/wallets.entity';
import { Receipt } from 'src/transactions/entities/receipt.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @OneToOne(() => User, (user) => user.profile, { nullable: false })
  user: User;

  @OneToMany(() => Category, (category) => category.profile, {
    onDelete: 'CASCADE',
  })
  categories: Category[];

  @OneToMany(() => Expense, (expense) => expense.profile, {
    onDelete: 'CASCADE',
  })
  expenses: Expense[];

  @OneToMany(() => Earning, (earning) => earning.profile, {
    onDelete: 'CASCADE',
  })
  earnings: Earning[];

  @OneToMany(() => Receipt, (receipt) => receipt.profile, {
    onDelete: 'CASCADE',
  })
  receipts: Receipt[];

  @OneToMany(() => Wallet, (wallet) => wallet.profile, {
    onDelete: 'CASCADE',
  })
  wallets: Wallet[];

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
