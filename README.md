# MealMaker

MealMaker is a web app that helps you discover recipes based on the ingredients you already have at home — reducing food waste and inspiring creative cooking.

## Features

- **Ingredient Search** — Enter one or more ingredients and find matching recipes
- **Smart Ranking** — Recipes that match more of your ingredients appear first, with a match badge showing how many ingredients were found
- **Category Filter** — Filter results by category such as Vegetarian, Vegan, Seafood, Beef and more
- **Autocomplete** — Ingredient input suggests matching ingredients from the MealDB database as you type
- **Recipe Detail Modal** — Click any recipe to see full ingredients, instructions and an image
- **Portion Calculator** — Adjust the number of portions and all ingredient amounts scale automatically
- **Cook List** — Save your favourite recipes to a persistent Cook List stored in localStorage, accessible via a slide-in drawer

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- [TheMealDB API](https://www.themealdb.com/api.php) for recipe and ingredient data
- No frameworks or libraries

## Project Structure
mealmaker/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── api.js
│   ├── ui.js
│   ├── favorites.js
│   └── app.js
├── media/
│   └── zuckerruben.svg
└── README.md

## Setup

No installation needed. Simply open `index.html` with a Live Server extension in VS Code, or any local server.

## API

This project uses the [TheMealDB](https://www.themealdb.com) API. A premium API key is required for full results.

## Author

Miro Delafontaine,Enya Conesa, Amelie Dobler, Nora Halter 