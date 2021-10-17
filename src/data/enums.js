// Protect enums using freeze to make immutable objects.
export const Genders = Object.freeze({
  Male: 'male',
  Female: 'female',
  Other: 'other',
});

export const Ethnies = Object.freeze({
  Black: 'male',
  White: 'female',
  Asiatic: 'asiatic',
  Arabic: 'arabic',
  Indian: 'indian'
});

export const Religions = Object.freeze({
  Christian: 'christian', 
  Muslim: 'muslim', 
  Hindu: 'hindu', 
  Animist: 'animist', 
  Atheist: 'atheist'
})

export const Orientations = Object.freeze({
  Straight: 'straight', 
  Bisexual: 'bisexual', 
  Gay: 'gay', 
  Lesbian: 'lesbian', 
  Heterosexual: 'heterosexual', 
  Homosexual: 'homosexual', 
  Pansexual: 'pansexual', 
  Asexual: 'asexual'
})

export const Relationships = Object.freeze({
  Family: 'family', 
  Friendship: 'friendship', 
  Romantic: 'romantic', 
  Business: 'business', 
  Work: 'work', 
  Erotic: 'erotic', 
  Marriage: 'marriage',
  Sex: 'sex'
})

export const Diets = Object.freeze({
  Vegetarian: 'vegetarian', 
  Cannibal: 'cannibal', 
  Chinese: 'chinese', 
  African: 'african', 
  Ethiopian: 'ethiopian',
  European: 'european', 
  Indian: 'indian', 
  Arabic: 'arabic',
  Japanese: 'japanese',
  Lebanese: 'lebanese',
  Korean: 'korean',
  Russian: 'russian'
})

export const Drinks = Object.freeze({
  Soft: 'soft',
  Hard: 'hard',
  Energy: 'energy',
  Water: 'water'
})