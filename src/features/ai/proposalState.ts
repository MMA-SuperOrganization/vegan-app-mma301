import type { MealProposal, PantryProposal } from './types';
export function reviewMealProposal(proposal: MealProposal): MealProposal {
  return {
    ...proposal,
    days: proposal.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal, index) => ({
        ...meal,
        reviewKey: day.date + '-' + index,
      })),
    })),
  };
}
export function reviewPantryProposal(proposal: PantryProposal): PantryProposal {
  return {
    ...proposal,
    items: proposal.items.map((item, index) => ({
      ...item,
      reviewKey: proposal.proposalId + '-' + index,
    })),
  };
}
export function mealConfirmationInput(proposal: MealProposal) {
  return {
    title: proposal.title.trim(),
    activate: false,
    days: proposal.days.map((day) => ({
      date: day.date,
      meals: day.meals.map(({ slot, recipeId, servings }) => ({
        slot,
        recipeId,
        servings,
      })),
    })),
  };
}
