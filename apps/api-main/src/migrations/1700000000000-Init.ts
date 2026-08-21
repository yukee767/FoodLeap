import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    // users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" citext UNIQUE NOT NULL,
        "password_hash" text NOT NULL,
        "name" varchar NOT NULL,
        "role" varchar CHECK (role IN ('user','nutritionist','admin')) DEFAULT 'user' NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "deleted_at" TIMESTAMPTZ
      );
      CREATE INDEX "IDX_users_role" ON "users" ("role");
    `);

    // recipes
    await queryRunner.query(`
      CREATE TABLE "recipes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar UNIQUE NOT NULL,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "instructions" text NOT NULL,
        "prep_time_min" int CHECK (prep_time_min > 0) NOT NULL,
        "difficulty" varchar CHECK (difficulty IN ('facil','medio','dificil')) DEFAULT 'medio' NOT NULL,
        "cover_url" varchar,
        "protein_main" varchar NOT NULL,
        "kcal_range" varchar CHECK (kcal_range IN ('baixa','media','alta')) DEFAULT 'media' NOT NULL,
        "is_published" boolean DEFAULT true NOT NULL,
        "search_vector" tsvector,
        "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
      );
      CREATE INDEX "IDX_recipes_published_created" ON "recipes" ("is_published", "created_at" DESC);
      CREATE INDEX "IDX_recipes_prep_time" ON "recipes" ("prep_time_min");
      CREATE INDEX "IDX_recipes_search_gin" ON "recipes" USING GIN ("search_vector");
      CREATE INDEX "IDX_recipes_trgm_title" ON "recipes" USING GIN ("title" gin_trgm_ops);
    `);

    // search_vector trigger
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION recipes_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.title,''))), 'A') ||
                             setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.description,''))), 'B') ||
                             setweight(to_tsvector('portuguese', unaccent(coalesce(NEW.protein_main,''))), 'C');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER trg_recipes_search_vector BEFORE INSERT OR UPDATE ON "recipes"
      FOR EACH ROW EXECUTE FUNCTION recipes_search_vector_update();
    `);

    // ingredients
    await queryRunner.query(`
      CREATE TABLE "ingredients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" citext UNIQUE NOT NULL,
        "category" varchar,
        "kcal_per_100g" numeric
      );
    `);

    // recipe_ingredients
    await queryRunner.query(`
      CREATE TABLE "recipe_ingredients" (
        "recipe_id" uuid NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
        "ingredient_id" uuid NOT NULL REFERENCES "ingredients"("id") ON DELETE CASCADE,
        "quantity" numeric NOT NULL,
        "unit" varchar NOT NULL,
        PRIMARY KEY ("recipe_id","ingredient_id")
      );
    `);

    // occasions
    await queryRunner.query(`
      CREATE TABLE "occasions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar UNIQUE NOT NULL,
        "titulo" varchar NOT NULL,
        "descricao" text NOT NULL
      );
    `);

    // recipe_occasions
    await queryRunner.query(`
      CREATE TABLE "recipe_occasions" (
        "recipe_id" uuid NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
        "occasion_id" uuid NOT NULL REFERENCES "occasions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("recipe_id","occasion_id")
      );
      CREATE INDEX "IDX_recipe_occasions_occasion" ON "recipe_occasions" ("occasion_id");
    `);

    // diet_profiles
    await queryRunner.query(`
      CREATE TABLE "diet_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "answers" jsonb NOT NULL,
        "computed_at" TIMESTAMPTZ,
        "version" int DEFAULT 1 NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
        "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
      );
      CREATE INDEX "IDX_diet_profiles_user" ON "diet_profiles" ("user_id");
    `);

    // meal_plans
    await queryRunner.query(`
      CREATE TABLE "meal_plans" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "generated_by" varchar CHECK (generated_by IN ('user','system')) DEFAULT 'system' NOT NULL,
        "week_start" date NOT NULL,
        "total_kcal" int,
        "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
      );
      CREATE INDEX "IDX_meal_plans_user_week" ON "meal_plans" ("user_id","week_start");
      CREATE TABLE "meal_plan_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "plan_id" uuid NOT NULL REFERENCES "meal_plans"("id") ON DELETE CASCADE,
        "recipe_id" uuid NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
        "day_of_week" smallint CHECK (day_of_week BETWEEN 1 AND 7) NOT NULL,
        "meal_type" varchar CHECK (meal_type IN ('cafe','almoco','jantar','lanche')) NOT NULL,
        "portion" numeric DEFAULT 1 NOT NULL
      );
    `);

    // updated_at trigger
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
      BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
      CREATE TRIGGER trg_users_updated BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      CREATE TRIGGER trg_recipes_updated BEFORE UPDATE ON "recipes" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      CREATE TRIGGER trg_diet_profiles_updated BEFORE UPDATE ON "diet_profiles" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_plan_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_plans" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "diet_profiles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipe_occasions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "occasions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipe_ingredients" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredients" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}
