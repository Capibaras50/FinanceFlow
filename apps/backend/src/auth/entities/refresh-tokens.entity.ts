import { hash } from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import crypto from 'node:crypto';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  token: string;

  @Column({ type: 'text', nullable: false, name: 'token_hash' })
  tokenHash: string;

  @ManyToOne(() => User, (user) => user.refreshToken, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: false,
  })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @BeforeInsert()
  async hashToken() {
    this.token = await hash(this.token, 10);
  }

  @BeforeInsert()
  hashTokenCrypto() {
    this.tokenHash = crypto
      .createHash('sha256')
      .update(this.tokenHash)
      .digest('hex');
  }
}
