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
import { CategoryType } from '../enums/category-type.enum';

@Entity('categories')
@Unique(['name', 'profile'])
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 7, nullable: false })
  color: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    nullable: false,
  })
  type: CategoryType;

  @ManyToOne(() => Profile, (profile) => profile.categories)
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'id' })
  profile: Profile;

  @OneToMany(() => Expense, (expense) => expense.category, {
    onDelete: 'CASCADE',
  })
  expenses: Expense[];

  @OneToMany(() => Earning, (earning) => earning.category, {
    onDelete: 'CASCADE',
  })
  earnings: Earning[];

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
