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
import { Debt } from 'src/debts/entities/debt.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('profiles')
export class Profile {
  @ApiProperty({
    description: 'ID of profile',
    example: 1,
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: 'name of profile',
    example: 'Andres',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @ApiPropertyOptional({
    description: 'avatar url of user',
    example: 'https://example.com/example',
  })
  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @ApiProperty({
    description: 'user associated with the profile',
    type: () => User,
  })
  @OneToOne(() => User, (user) => user.profile, { nullable: false })
  user: User;

  @ApiProperty({
    description: 'categories associated with the profile',
    type: () => [Category],
  })
  @OneToMany(() => Category, (category) => category.profile, {
    onDelete: 'CASCADE',
  })
  categories: Category[];

  @ApiProperty({
    description: 'expenses associated with the profile',
    type: () => [Expense],
  })
  @OneToMany(() => Expense, (expense) => expense.profile, {
    onDelete: 'CASCADE',
  })
  expenses: Expense[];

  @ApiProperty({
    description: 'earnings associated with the profile',
    type: () => [Earning],
  })
  @OneToMany(() => Earning, (earning) => earning.profile, {
    onDelete: 'CASCADE',
  })
  earnings: Earning[];

  @ApiProperty({
    description: 'receipts associated with the profile',
    type: () => [Receipt],
  })
  @OneToMany(() => Receipt, (receipt) => receipt.profile, {
    onDelete: 'CASCADE',
  })
  receipts: Receipt[];

  @ApiProperty({
    description: 'wallets associated with the profile',
    type: () => [Wallet],
  })
  @OneToMany(() => Wallet, (wallet) => wallet.profile, {
    onDelete: 'CASCADE',
  })
  wallets: Wallet[];

  @ApiProperty({
    description: 'debts associated with the profile',
    type: () => [Debt],
  })
  @OneToMany(() => Debt, (debt) => debt.profile, {
    onDelete: 'CASCADE',
  })
  debts: Debt[];

  @ApiProperty({
    description: 'date when the profile was created',
    example: new Date(),
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'date when the profile was updated',
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
}
