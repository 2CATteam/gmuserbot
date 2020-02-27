from math import floor
from random import random
sections = ['marimbas', 'vibes', 'rock band peeps', 'xylophones', 'snares', 'quads', 'cymbals', 'basses']

for section in sections:
    rand = random()
    rand = rand * 10 + 1
    rand = floor(rand)
    print("The " + section + " are a " + str(rand) + " out of 10")