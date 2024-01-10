"""
FUTURE CLASSROOM - PYTHON FUNDAMENTALS
PROJECT NAME: DISH FINDER CHATBOT
LESSON 17
BY: KODING NEXT

"""

from requests import get 

# Welcome message
print    ("Welcome to Dish Finder Chatbot!")
print("You can look for a recipe for a certain dish, or...")
print("We can give surprise to generate a random dish recipe.")
print("The choice is yours.")
input('')
input  ()


# API endpoint URL
base_url = "https://www.themealdb.com/api/json/v1/1/"

while True:
    # Offer options for interaction
    print("")
    print("What food dish recipe would you like to look for today?")

    options = [
        "Tell me a random recipe.",
        "Search for a specific dish.",
        "Quit.",
    ]

    for i, option in enumerate(options):
        print(f"{i+1}. {option}")

    # Get user choice and handle actions
    print("")
    choice = int(input("Enter your choice: "))

    if choice == 1:
        # Fetch a random recipe
        random_recipe_url = f"{base_url}random.php"
        response = get (random_recipe_url)
        response = response.json()
        recipe = response["meals"][0]
        print("")
        print(f"Let's make {recipe['strMeal']}!")
        print("")
        print(f"{recipe['strInstructions']}")
        image_url = recipe["strMealThumb"]
        print("")
        print(f"Dish image: {image_url}")

    elif choice == 2:
        # Search for a specific dish
        dish_name = input("Enter the name of the dish you're craving: ").lower()
        search_url = f"{base_url}search.php?s={dish_name}"
        response = get(search_url)
        response = response.json()

        if response["meals"]:
            recipe = response["meals"][0]
            print("")
            print(f"Found it! Let's make {recipe['strMeal']}.")
            print("")
            print(f"{recipe['strInstructions']}")
            image_url = recipe["strMealThumb"]
            print("")
            print(f"Drool-worthy image here: {image_url}")
        else:
            print(f"Sorry, couldn't find that dish. Try a different name or browse the popular options!")

    elif choice == 3:
        # Quit and save cravings
        print("Bon appétit! See you next time your tummy starts rumbling.")
        break

    else:
        print("Invalid choice. Please try again.")