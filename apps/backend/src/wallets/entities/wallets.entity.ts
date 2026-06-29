import { Earning } from 'src/transactions/entities/earning.entity';
import { Expense } from 'src/transactions/entities/expense.entity';
import { Profile } from 'src/users/entities/profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Unique(['name', 'profile'])
@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @ManyToOne(() => Profile, (profile) => profile.wallets)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => Earning, (earning) => earning.wallet, {
    onDelete: 'CASCADE',
  })
  earnings: Earning[];

  @OneToMany(() => Expense, (expense) => expense.wallet, {
    onDelete: 'CASCADE',
  })
  expenses: Expense[];

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
