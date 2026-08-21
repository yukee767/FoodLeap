import type { Recipe } from '@foodleap/shared-types';

export function jsonLdRecipe(recipe: Recipe & { ingredients?: string[]; steps?: string[]; cover_url?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.cover_url ? [recipe.cover_url] : undefined,
    description: recipe.description,
    recipeCategory: recipe.occasions?.join(', '),
    prepTime: `PT${recipe.prep_time_min}M`,
    recipeIngredient: recipe.ingredients ?? [],
    recipeInstructions: (recipe.steps ?? []).map((s) => ({ '@type': 'HowToStep', text: s })),
    author: { '@type': 'Organization', name: 'FoodLeap' },
  };
}

export function jsonLdItemList(recipes: Recipe[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: recipes.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://foodleap.com.br/receitas/${r.slug}`,
      name: r.title,
    })),
  };
}

export function jsonLdBreadcrumb(items: { name: string; item?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
