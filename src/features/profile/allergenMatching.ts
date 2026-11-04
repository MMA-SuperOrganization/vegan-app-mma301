interface AllergenLabel {
  _id: string;
  name: string;
}

export function matchingAllergenNames(
  contentAllergenIds: string[] | undefined,
  profileAllergenIds: string[],
  catalog: AllergenLabel[],
  unknownLabel: string,
  label: (name: string) => string = (name) => name
) {
  const selected = new Set(profileAllergenIds);
  return (contentAllergenIds ?? [])
    .filter((allergenId) => selected.has(allergenId))
    .map(
      (allergenId) =>
        catalog.find((allergen) => allergen._id === allergenId)?.name ?? unknownLabel
    )
    .map((name) => (name === unknownLabel ? name : label(name)));
}
