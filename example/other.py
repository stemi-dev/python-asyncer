# Tvoj sljedeći zadatak je izmijeniti Bota tako da uvrstiš i treću opciju kada nije odabran
# niti jedan od ponuđenih izbora.

import traceback

A = [1, 2, 3, 4]

# exception handling
try:
    value = A[5]

except:
    # printing stack trace
    print(traceback.format_exc())

print('Bok!')
name = input('Ja sam PizzaBot. Kako se zoveš?')
print('Drago mi je ' + name + '. Što želiš napraviti dalje:')
while True:
    print('a. Pokaži pizzu')
    print('b. Naruči pizzu')
    choice = input('Odaberi jednu od ponuđenih opcija: ')
    if choice == 'a':
        a = 10
        a[10] = 123

        print('Odabrao si opciju ' + choice)
        print('Ponuđene pizze su: ')
        print('1. Margherita(rajčica,sir)')
        print('2. Funghi(rajčica,sir,gljive)')
    elif choice == 'b':
        print('Odabrao si opciju ' + choice)
    else:
        print('Odabrao si opciju ' + choice)
        print('hello')
