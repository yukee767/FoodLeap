import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.js';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  instructions!: string;

  @Column({ type: 'int' })
  prep_time_min!: number;

  @Column({ type: 'enum', enum: ['facil', 'medio', 'dificil'], default: 'medio' })
  difficulty!: 'facil' | 'medio' | 'dificil';

  @Column({ type: 'varchar', nullable: true })
  cover_url!: string | null;

  @Column({ type: 'varchar' })
  protein_main!: string;

  @Column({ type: 'enum', enum: ['baixa', 'media', 'alta'], default: 'media' })
  kcal_range!: 'baixa' | 'media' | 'alta';

  @Column({ type: 'boolean', default: true })
  is_published!: boolean;

  @Column({ type: 'tsvector', nullable: true, select: false })
  search_vector!: string | null;

  @Column({ type: 'uuid', nullable: true })
  author_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author!: User | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
