import { Category } from 'src/categories/entities/category.entity';
import { Profile } from 'src/users/entities/profile.entity';
import { Wallet } from 'src/wallets/entities/wallets.entity';
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

@Entity('earnings')
export class Earning {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', nullable: false, precision: 12, scale: 2 })
  value: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.earnings)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @ManyToOne(() => Profile, (profile) => profile.earnings)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

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
