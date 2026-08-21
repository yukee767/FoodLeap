import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Recipe } from './Recipe.js';
import { Occasion } from './Occasion.js';

@Entity('recipe_occasions')
export class RecipeOccasion {
  @PrimaryColumn({ type: 'uuid' })
  recipe_id!: string;

  @PrimaryColumn({ type: 'uuid' })
  occasion_id!: string;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @ManyToOne(() => Occasion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'occasion_id' })
  occasion!: Occasion;
}
