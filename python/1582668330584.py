people = 'Colton', 'Ryan', 'Chase', 'Olivia', 'Brock'

def do_i_h8_you(people):
    for person in people:
        if person == 'Chase':
            print('I h8 you, ' + person)
        else:
            print("Hey, " + person + " is pretty cool")

do_i_h8_you(people)