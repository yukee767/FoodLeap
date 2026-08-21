import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Recipe } from './Recipe.js';
import { Ingredient } from './Ingredient.js';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @PrimaryColumn({ type: 'uuid' })
  recipe_id!: string;

  @PrimaryColumn({ type: 'uuid' })
  ingredient_id!: string;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @ManyToOne(() => Ingredient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient!: Ingredient;

  @Column({ type: 'numeric' })
  quantity!: string;

  @Column({ type: 'varchar' })
  unit!: string;
}
