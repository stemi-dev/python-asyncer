import json
import re
import traceback


index = -1
inputs = ["32","14","15","Esperanza"]
expected_definitions = {"name":"Esperanza","c":46,"c2":448}
expected_outputs = ["46","46","46","Your age is: 15","Hello Esperanza","/\\w+ Esperanza/"]
expected_comments = ["None","None","None","None","None","None"]
outputs = []


class KillProgram(RuntimeError):
    pass


class WrongNumberOfInputs(RuntimeError):
    def __init__(self, index):
        self.index = index


async def custom_input(prompt: str = None):
    global index
    index += 1

    if index >= len(inputs):
        raise WrongNumberOfInputs(index)

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)

async def internal_func_name_user_code():
    ex = None
    try:
        f''' 
        FUTURE CLASSROOM - PYTHON FUNDAMENTALS 
        PROJECT NAME: DISH FINDER CHATBOT 
        LESSON 17 
        BY: KODING NEXT 
         
        '''
         #|LINE_NUM:7|#
         #|LINE_NUM:8|#
         #|LINE_NUM:9|#
        from pyodide.http import pyfetch #|LINE_NUM:10|#
         #|LINE_NUM:11|#
        async def get(url): #|LINE_NUM:12|#
            response = await pyfetch(url) #|LINE_NUM:13|#
            response.status_code = response.status #|LINE_NUM:14|#
            return response #|LINE_NUM:15|#
         #|LINE_NUM:16|#
         #|LINE_NUM:17|#
         #|LINE_NUM:18|#
        custom_print("Welcome to Dish Finder Chatbot!") #|LINE_NUM:20|#
        custom_print("You can look for a recipe for a certain dish, or...") #|LINE_NUM:21|#
        custom_print("We can give surprise to generate a random dish recipe.") #|LINE_NUM:22|#
        custom_print("The choice is yours.") #|LINE_NUM:23|#
        (await custom_input('')) #|LINE_NUM:24|#
        custom_input() #|LINE_NUM:25|#
         #|LINE_NUM:26|#
         #|LINE_NUM:27|#
        base_url = "https://www.themealdb.com/api/json/v1/1/" #|LINE_NUM:29|#
         #|LINE_NUM:30|#
        while_0 = 0
        while True: #|LINE_NUM:31|# # while_0
            if while_0 >= 1000:
                raise RuntimeError(f"Max number of iterations exceeded (1000) for while_0")
            while_0 = while_0 + 1
            # Offer options for interaction #|LINE_NUM:32|#
            custom_print("") #|LINE_NUM:33|#
            custom_print("What food dish recipe would you like to look for today?") #|LINE_NUM:34|#
         #|LINE_NUM:35|#
            options = [ #|LINE_NUM:36|#
                "Tell me a random recipe.", #|LINE_NUM:37|#
                "Search for a specific dish.", #|LINE_NUM:38|#
                "Quit.", #|LINE_NUM:39|#
            ] #|LINE_NUM:40|#
         #|LINE_NUM:41|#
            for i, option in enumerate(options): #|LINE_NUM:42|#
                custom_print(f"{i+1}. {option}") #|LINE_NUM:43|#
         #|LINE_NUM:44|#
            # Get user choice and handle actions #|LINE_NUM:45|#
            custom_print("") #|LINE_NUM:46|#
            choice = int((await custom_input("Enter your choice: "))) #|LINE_NUM:47|#
         #|LINE_NUM:48|#
            if choice == 1: #|LINE_NUM:49|#
                # Fetch a random recipe #|LINE_NUM:50|#
                random_recipe_url = f"{base_url}random.php" #|LINE_NUM:51|#
                response = await get (random_recipe_url) #|LINE_NUM:52|#
                response = await (response.json()) #|LINE_NUM:53|#
                recipe = response["meals"][0] #|LINE_NUM:54|#
                custom_print("") #|LINE_NUM:55|#
                custom_print(f"Let's make {recipe['strMeal']}!") #|LINE_NUM:56|#
                custom_print("") #|LINE_NUM:57|#
                custom_print(f"{recipe['strInstructions']}") #|LINE_NUM:58|#
                image_url = recipe["strMealThumb"] #|LINE_NUM:59|#
                custom_print("") #|LINE_NUM:60|#
                custom_print(f"Dish image: {image_url}") #|LINE_NUM:61|#
         #|LINE_NUM:62|#
            elif choice == 2: #|LINE_NUM:63|#
                # Search for a specific dish #|LINE_NUM:64|#
                dish_name = (await custom_input("Enter the name of the dish you're craving: ")).lower() #|LINE_NUM:65|#
                search_url = f"{base_url}search.php?s={dish_name}" #|LINE_NUM:66|#
                response = await get(search_url) #|LINE_NUM:67|#
                response = await (response.json()) #|LINE_NUM:68|#
         #|LINE_NUM:69|#
                if response["meals"]: #|LINE_NUM:70|#
                    recipe = response["meals"][0] #|LINE_NUM:71|#
                    custom_print("") #|LINE_NUM:72|#
                    custom_print(f"Found it! Let's make {recipe['strMeal']}.") #|LINE_NUM:73|#
                    custom_print("") #|LINE_NUM:74|#
                    custom_print(f"{recipe['strInstructions']}") #|LINE_NUM:75|#
                    image_url = recipe["strMealThumb"] #|LINE_NUM:76|#
                    custom_print("") #|LINE_NUM:77|#
                    custom_print(f"Drool-worthy image here: {image_url}") #|LINE_NUM:78|#
                else: #|LINE_NUM:79|#
                    custom_print(f"Sorry, couldn't find that dish. Try a different name or browse the popular options!") #|LINE_NUM:80|#
         #|LINE_NUM:81|#
            elif choice == 3: #|LINE_NUM:82|#
                # Quit and save cravings #|LINE_NUM:83|#
                custom_print("Bon appétit! See you next time your tummy starts rumbling.") #|LINE_NUM:84|#
                break #|LINE_NUM:85|#
         #|LINE_NUM:86|#
            else: #|LINE_NUM:87|#
                custom_print("Invalid choice. Please try again.") #|LINE_NUM:88|#
    except KillProgram:
        pass
    except WrongNumberOfInputs as e:
        ex = "WRONG_NUMBER_OF_INPUTS: Wrong number of inputs: " + str(e.index)
    except Exception as e:
        ex = traceback.format_exc()
    finally:
        return locals(), ex

class Result:
    def __init__(self, test_pass, test_type, comment=None, verbose=None, index=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment
        self.verbose = verbose
        self.index = index

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment, "verbose": self.verbose, "index": self.index}


async def main():
    try:
        defines, exception = await internal_func_name_user_code()
        if exception:
            return json.dumps({"error": exception})
    except Exception as e:
        return json.dumps({"error": str(e)})

    results = []
    for key in expected_definitions:
        if key not in defines:
            results.append(Result(False, 'defined', f"variable '{key}' not found"))
        elif defines[key] != expected_definitions[key]:
            comment = f"variable '{key}' not expected value, found: {defines[key]}, expected: {expected_definitions[key]}"
            results.append(Result(False, 'defined', comment))
        else:
            results.append(Result(True, 'defined', key))

    if len(outputs) != len(expected_outputs):
        results.append(Result(False, 'number_of_prints', f'You had {len(outputs)} print{"" if len(outputs) == 1 else "s"}, but this test expected you to have {len(expected_outputs)} print{"" if len(expected_outputs) == 1 else "s"}', verbose=[outputs, expected_outputs]))
    else:
        results.append(Result(True, 'number_of_prints', 'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]
            c = expected_comments[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a, re.DOTALL)
                if match is None:
                    comment = c or f'REGEX "{a}" does not match "{b}"'
                    if comment == c:
                        comment = f'{comment}, [Your output was: "{a}"]'

                    results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
                else:
                    results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))
            elif a != b:
                comment = c or 'We expected to see "{b}" and you printed "{a}"'
                results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
            else:
                results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))