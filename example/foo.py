"""
Pokušajte sada izmijeniti postojeći program tako da u njega uvedete listu s popisom
pizza. Na mjestima gdje je potrebno ispisati pojedini dio liste ispišite samo dio,
a na mjestima gdje želimo ispisati cijeli popis napravite njegov ispis.

"""
popisPizza = ['1. Margherita(rajčica,sir)','2. Funghi(rajčica,sir,funghi)']
print('Bok!')
imeOsobe = input('Ja sam PizzaBot. Kako se zoveš?' )
print('Drago mi je ' + imeOsobe + '. Što želiš napraviti dalje:')
while True:
    print('a. Pokaži pizzu')
    print('b. Naruči pizzu')
    izbor = input('Odaberi jednu od ponuđenih opcija: ')
    if izbor == 'a':
        print('Odabrao si opciju: ' + izbor)
        print('Podnuđene pizze su: ')
        print(popisPizza)
    elif izbor == 'b':
        print('Odabrao si opciju: ' + izbor + ' \n')
        print('Podnuđene pizze su: ')
        print(popisPizza)
        izborPizze = input('Koju pizzu' + imeOsobe + 'želiš naručiti? ')
        if izborPizze == '1':
            print('Tvoj izbor je Margherita')
            print('Tvoj izbor je '+ popisPizza[0])
        elif izborPizze == '2':
            print('Tvoj izbor je Funghi')
            print('Tvoj izbor je '+ popisPizza[1])
        else:
            print('Na žalost taj izbor nemamo u našem menu')
    else:
        print('Došlo je do nesporazuma, nisi odabrao niti jednu ponuđenu opciju.')
        print('Molim te odaberi ponovno\n')
    break
        