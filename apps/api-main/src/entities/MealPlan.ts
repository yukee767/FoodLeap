import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User.js';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: ['user', 'system'], default: 'system' })
  generated_by!: 'user' | 'system';

  @Column({ type: 'date' })
  week_start!: string;

  @Column({ type: 'int', nullable: true })
  total_kcal!: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

@Entity('meal_plan_items')
export class MealPlanItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  plan_id!: string;

  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: MealPlan;

  @Column({ type: 'uuid' })
  recipe_id!: string;

  @Column({ type: 'smallint' })
  day_of_week!: number;

  @Column({ type: 'enum', enum: ['cafe', 'almoco', 'jantar', 'lanche'] })
  meal_type!: 'cafe' | 'almoco' | 'jantar' | 'lanche';

  @Column({ type: 'numeric', default: 1 })
  portion!: string;
}
