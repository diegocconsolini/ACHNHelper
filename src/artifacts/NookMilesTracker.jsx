import React, { useState, useEffect } from 'react';

const NOOK_MILES_DATA = [
  { id: 101, name: "Angling for Perfection!", category: "Fishing", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 102, name: "Island Ichthyologist", category: "Fishing", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 40, reward: 2000 },{ target: 60, reward: 3000 }], isRepeatable: false },
  { id: 103, name: "Fishing Tourney Champ", category: "Fishing", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 }], isRepeatable: true },
  { id: 104, name: "Catch Me If You Can", category: "Bug Catching", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 105, name: "Bug Off Champion", category: "Bug Catching", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 }], isRepeatable: true },
  { id: 106, name: "Island Entomologist", category: "Bug Catching", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 40, reward: 2000 },{ target: 60, reward: 3000 }], isRepeatable: false },
  { id: 107, name: "Deep Sea Fishing", category: "Diving", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 108, name: "Island Aquarium", category: "Diving", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 40, reward: 2000 },{ target: 60, reward: 3000 }], isRepeatable: false },
  { id: 109, name: "Flower Power", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 500, reward: 2000 },{ target: 1000, reward: 3000 }], isRepeatable: false },
  { id: 110, name: "Tropical Medley", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: false },
  { id: 111, name: "Weeding Out the Negativity", category: "Gardening", tiers: [{ target: 50, reward: 300 },{ target: 200, reward: 500 },{ target: 500, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 2000, reward: 3000 }], isRepeatable: true },
  { id: 112, name: "Fruit Picking", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 113, name: "Shroom Forager", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 }], isRepeatable: false },
  { id: 114, name: "Wood to the Wise", category: "Nature", tiers: [{ target: 30, reward: 300 },{ target: 100, reward: 500 },{ target: 300, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 115, name: "DIY Workshop", category: "DIY", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: false },
  { id: 116, name: "A Matter of Customization", category: "DIY", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 117, name: "Complete Furniture Catalog", category: "Houseware", tiers: [{ target: 50, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 300, reward: 2000 }], isRepeatable: false },
  { id: 118, name: "Wall to Wall Catalouge", category: "Houseware", tiers: [{ target: 10, reward: 300 },{ target: 25, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: false },
  { id: 119, name: "Fashion Connoisseur", category: "Fashion", tiers: [{ target: 50, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 300, reward: 2000 }], isRepeatable: false },
  { id: 120, name: "Shoe In", category: "Fashion", tiers: [{ target: 10, reward: 300 },{ target: 25, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: false },
  { id: 121, name: "Headwear Head Start", category: "Fashion", tiers: [{ target: 10, reward: 300 },{ target: 25, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: false },
  { id: 122, name: "Bug Hunting", category: "Bug Catching", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 50, reward: 2000 },{ target: 100, reward: 3000 }], isRepeatable: true },
  { id: 123, name: "Photography Class", category: "Photography", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: false },
  { id: 124, name: "Bell Ringer", category: "Commerce", tiers: [{ target: 100000, reward: 500 },{ target: 1000000, reward: 1000 },{ target: 10000000, reward: 2000 },{ target: 100000000, reward: 3000 }], isRepeatable: true },
  { id: 125, name: "Nook Inc. Investor", category: "Commerce", tiers: [{ target: 500000, reward: 500 },{ target: 5000000, reward: 1000 },{ target: 50000000, reward: 2000 }], isRepeatable: false },
  { id: 126, name: "Item Shop: Oh Yeah!", category: "Commerce", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 127, name: "Island Historian", category: "Island Life", tiers: [{ target: 15, reward: 300 },{ target: 30, reward: 500 },{ target: 60, reward: 1000 },{ target: 80, reward: 2000 },{ target: 100, reward: 3000 }], isRepeatable: false },
  { id: 128, name: "Island Friendship", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 },{ target: 20, reward: 3000 }], isRepeatable: false },
  { id: 129, name: "Villager Whisperer", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 500, reward: 3000 }], isRepeatable: true },
  { id: 130, name: "Island Tour", category: "Travel", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 },{ target: 20, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true },
  { id: 131, name: "Visiting Friends", category: "Communication", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 },{ target: 20, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true },
  { id: 132, name: "Hospitality", category: "Communication", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 },{ target: 20, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true },
  { id: 133, name: "Nook Miles Traveler", category: "Travel", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 },{ target: 25, reward: 2000 }], isRepeatable: true },
  { id: 134, name: "Museum Open", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 135, name: "Museum Tour", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: false },
  { id: 136, name: "Shop, Shop, Hooray!", category: "Commerce", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 }], isRepeatable: false },
  { id: 137, name: "Dye Nook Open", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 138, name: "Tailoring Shop Open", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 139, name: "Let Loose!", category: "Event", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 }], isRepeatable: true },
  { id: 140, name: "Happy Camper", category: "Event", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: false },
  { id: 141, name: "Nook Inc. New Leaf Investor", category: "Commerce", tiers: [{ target: 1, reward: 2000 }], isRepeatable: false },
  { id: 142, name: "Pocket Full of Bells", category: "Commerce", tiers: [{ target: 1000000, reward: 500 },{ target: 10000000, reward: 1000 },{ target: 100000000, reward: 2000 },{ target: 1000000000, reward: 3000 }], isRepeatable: false },
  { id: 143, name: "Ore or Less", category: "Nature", tiers: [{ target: 30, reward: 300 },{ target: 100, reward: 500 },{ target: 300, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 144, name: "Fossil Fanatic", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: false },
  { id: 145, name: "Star Fragments", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 30, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: true },
  { id: 146, name: "Breaking News", category: "Communication", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 }], isRepeatable: false },
  { id: 147, name: "Message in a Bottle", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: false },
  { id: 148, name: "Creature Collector", category: "Island Life", tiers: [{ target: 50, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 300, reward: 2000 }], isRepeatable: false },
  { id: 149, name: "Balloon Buster", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 150, name: "Bells to Spare", category: "Commerce", tiers: [{ target: 100000, reward: 300 },{ target: 1000000, reward: 500 },{ target: 10000000, reward: 1000 },{ target: 100000000, reward: 2000 },{ target: 1000000000, reward: 3000 }], isRepeatable: false },
  { id: 151, name: "Fishing Skillup", category: "Fishing", tiers: [{ target: 1, reward: 100 },{ target: 5, reward: 200 },{ target: 10, reward: 300 }], isRepeatable: true },
  { id: 152, name: "Bug Catching Skillup", category: "Bug Catching", tiers: [{ target: 1, reward: 100 },{ target: 5, reward: 200 },{ target: 10, reward: 300 }], isRepeatable: true },
  { id: 153, name: "Sea Creature Skillup", category: "Diving", tiers: [{ target: 1, reward: 100 },{ target: 5, reward: 200 },{ target: 10, reward: 300 }], isRepeatable: true },
  { id: 154, name: "Nice to Meet You", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 155, name: "Island Showoff", category: "Island Life", tiers: [{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 156, name: "Island Beautification", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: false },
  { id: 157, name: "Tile Menace", category: "Island Life", tiers: [{ target: 20, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 400, reward: 2000 }], isRepeatable: true },
  { id: 158, name: "Desert Island Dinner", category: "DIY", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: false },
  { id: 159, name: "Gone Gold", category: "Nature", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 }], isRepeatable: false },
  { id: 160, name: "Nook Inc. Ambassador", category: "Communication", tiers: [{ target: 1, reward: 2000 }], isRepeatable: false },
  { id: 161, name: "Nook Inc. Escalator", category: "Commerce", tiers: [{ target: 50000, reward: 300 },{ target: 500000, reward: 500 },{ target: 5000000, reward: 1000 },{ target: 50000000, reward: 2000 }], isRepeatable: true },
  { id: 162, name: "Bug Catching Pro", category: "Bug Catching", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 163, name: "Fishing Enthusiast", category: "Fishing", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 164, name: "Diving Enthusiast", category: "Diving", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 165, name: "Crafting Enthusiast", category: "DIY", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 166, name: "Nook Shop Maniac", category: "Commerce", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 167, name: "Island Incinerator", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 168, name: "Starting a Collection", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 }], isRepeatable: false },
  { id: 169, name: "Nook Inc. Completion Achievement", category: "Commerce", tiers: [{ target: 1, reward: 3000 }], isRepeatable: false },
  { id: 170, name: "Museum Completion", category: "Island Life", tiers: [{ target: 1, reward: 3000 }], isRepeatable: false },
  { id: 171, name: "Island Miles!", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 172, name: "Writing a Cookbook?", category: "Cooking", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 }], isRepeatable: false },
  { id: 173, name: "Mmm-Mmm-Miles!", category: "Cooking", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 174, name: "Nice to Meet You, Gyroid!", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 }], isRepeatable: false },
  { id: 175, name: "Gyroid Getter", category: "Island Life", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 }], isRepeatable: false },
  { id: 176, name: "Miles for Stalkholders", category: "Commerce", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 177, name: "Cornering the Stalk Market", category: "Commerce", tiers: [{ target: 100000, reward: 500 },{ target: 1000000, reward: 1000 },{ target: 10000000, reward: 2000 }], isRepeatable: false },
  { id: 178, name: "No More Loan Payments!", category: "Commerce", tiers: [{ target: 1, reward: 2000 }], isRepeatable: false },
  { id: 179, name: "Bulletin-Board Benefit", category: "Communication", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 180, name: "Popular Pen Pal", category: "Communication", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: false },
  { id: 181, name: "Flea Flicker", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 }], isRepeatable: false },
  { id: 182, name: "Cicada Memories", category: "Bug Catching", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 183, name: "Netting Better!", category: "Bug Catching", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 184, name: "Pit-y Party!", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 185, name: "Taking the Sting Out", category: "Bug Catching", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 186, name: "Faint of Heart", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 187, name: "Overcoming Pitfalls", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 188, name: "Faked Out!", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 189, name: "Lost Treasure", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 190, name: "It's Raining Treasure!", category: "Island Life", tiers: [{ target: 50, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 300, reward: 2000 }], isRepeatable: true },
  { id: 191, name: "Fun with Fences", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 192, name: "Snowmaestro", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 },{ target: 20, reward: 2000 }], isRepeatable: false },
  { id: 193, name: "Wishes Come True", category: "Island Life", tiers: [{ target: 20, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: true },
  { id: 194, name: "Exterior Decorator", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 195, name: "Island Icons", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 196, name: "Island Designer", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 10, reward: 1000 },{ target: 50, reward: 2000 }], isRepeatable: true },
  { id: 197, name: "Wispy Island Secrets", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 198, name: "Gulliver's Travails", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 199, name: "K.K. Mania", category: "Event", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 200, name: "True Patron of the Arts", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 201, name: "You Otter Know", category: "Diving", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 202, name: "True Friends", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 2, reward: 1000 },{ target: 3, reward: 2000 }], isRepeatable: false },
  { id: 203, name: "Birthday Celebration", category: "Event", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 2000 }], isRepeatable: true },
  { id: 204, name: "Happy Birthday!", category: "Event", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 205, name: "Fishing Tourney!", category: "Fishing", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 206, name: "Bug-Off!", category: "Bug Catching", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 207, name: "Countdown Celebration", category: "Event", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 208, name: "Making a Change", category: "Fashion", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: true },
  { id: 209, name: "First Custom Design!", category: "Customization", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 210, name: "Custom Design Pro!", category: "Customization", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 211, name: "Paydirt!", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 }], isRepeatable: true },
  { id: 212, name: "Shady Shakedown", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 2000 }], isRepeatable: true },
  { id: 213, name: "Golden Milestone", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 5, reward: 1000 },{ target: 10, reward: 2000 }], isRepeatable: false },
  { id: 214, name: "Island and Yourland", category: "Travel", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 }], isRepeatable: true },
  { id: 215, name: "Host the Most", category: "Communication", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 2000 }], isRepeatable: true },
  { id: 216, name: "Active Island Resident", category: "Island Life", tiers: [{ target: 50, reward: 300 },{ target: 100, reward: 500 },{ target: 200, reward: 1000 },{ target: 300, reward: 2000 }], isRepeatable: false },
  { id: 217, name: "Sprout Out Loud", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true }
];

const CATEGORY_EMOJI = {
  "Fishing": "🎣",
  "Bug Catching": "🦋",
  "Diving": "🤿",
  "Gardening": "🌸",
  "Nature": "🌿",
  "DIY": "🔨",
  "Houseware": "🏠",
  "Fashion": "👔",
  "Commerce": "💰",
  "Island Life": "🏝️",
  "Communication": "💬",
  "Travel": "✈️",
  "Event": "🎉",
  "Photography": "📷",
  "Cooking": "🍳",
  "Customization": "🎨"
};

const CATEGORIES = [
  "All", "Fishing", "Bug Catching", "Diving", "Gardening", "Nature", "DIY",
  "Houseware", "Fashion", "Commerce", "Island Life", "Communication", "Travel",
  "Event", "Photography", "Cooking", "Customization"
];

export default function NookMilesTracker() {
  const [achievements, setAchievements] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('acnh-nook-miles-tracker');
        if (result) {
          setAchievements(JSON.parse(result.value));
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const saveData = async (newAchievements) => {
    try {
      await window.storage.set('acnh-nook-miles-tracker', JSON.stringify(newAchievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  };

  const toggleTier = (achievementId, tierIndex) => {
    const newAchievements = { ...achievements };
    if (!newAchievements[achievementId]) {
      newAchievements[achievementId] = 0;
    }
    if (newAchievements[achievementId] === tierIndex) {
      newAchievements[achievementId] = Math.max(0, tierIndex - 1);
    } else {
      newAchievements[achievementId] = tierIndex;
    }
    setAchievements(newAchievements);
    saveData(newAchievements);
  };

  const getFilteredAchievements = () => {
    return NOOK_MILES_DATA.filter(ach => {
      const categoryMatch = selectedCategory === "All" || ach.category === selectedCategory;
      const searchMatch = ach.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  };

  const calculateStats = () => {
    const filtered = getFilteredAchievements();
    let totalMiles = 0;
    let completedCount = 0;
    const categoryStats = {};

    CATEGORIES.slice(1).forEach(cat => {
      categoryStats[cat] = { completed: 0, total: 0, miles: 0 };
    });

    filtered.forEach(ach => {
      const currentTier = achievements[ach.id] || 0;
      let milesEarned = 0;

      for (let i = 0; i < currentTier; i++) {
        if (ach.tiers[i]) {
          milesEarned += ach.tiers[i].reward;
        }
      }

      totalMiles += milesEarned;
      if (currentTier === ach.tiers.length) {
        completedCount++;
      }

      if (categoryStats[ach.category]) {
        categoryStats[ach.category].completed += currentTier === ach.tiers.length ? 1 : 0;
        categoryStats[ach.category].total++;
        categoryStats[ach.category].miles += milesEarned;
      }
    });

    return { totalMiles, completedCount, categoryStats, totalAchievements: filtered.length };
  };

  const stats = calculateStats();

  if (isLoading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400&display=swap');
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🎖️ Nook Miles Tracker</h1>
        <div style={styles.headerStats}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Total Miles</div>
            <div style={styles.statValue}>{stats.totalMiles.toLocaleString()}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Completed</div>
            <div style={styles.statValue}>{stats.completedCount}/{stats.totalAchievements}</div>
          </div>
        </div>
      </div>

      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search achievements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.categoryFilterContainer}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === cat ? styles.categoryButtonActive : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.statsPanel}>
        {Object.entries(stats.categoryStats).filter(([_, data]) => data.total > 0).map(([cat, data]) => (
          <div key={cat} style={styles.catStatItem}>
            <span style={styles.catStatLabel}>{CATEGORY_EMOJI[cat]} {cat}</span>
            <span style={styles.catStatValue}>{data.completed}/{data.total} • {data.miles.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={styles.achievementsGrid}>
        {getFilteredAchievements().map(ach => {
          const currentTier = achievements[ach.id] || 0;
          const milesEarned = Array.from({ length: currentTier }, (_, i) => ach.tiers[i]?.reward || 0).reduce((a, b) => a + b, 0);

          return (
            <div key={ach.id} style={styles.achievementCard}>
              <div style={styles.achHeader}>
                <h3 style={styles.achName}>{ach.name}</h3>
                <div style={styles.achBadges}>
                  <span style={styles.categoryBadge}>
                    {CATEGORY_EMOJI[ach.category]} {ach.category}
                  </span>
                  {ach.isRepeatable && <span style={styles.repeatableBadge}>🔄 Repeatable</span>}
                </div>
              </div>

              <div style={styles.tiersContainer}>
                {ach.tiers.map((tier, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleTier(ach.id, idx + 1)}
                    style={{
                      ...styles.tierButton,
                      ...(currentTier > idx ? styles.tierButtonCompleted : {}),
                      ...(currentTier === idx + 1 ? styles.tierButtonActive : {})
                    }}
                  >
                    <div style={styles.tierTarget}>{tier.target.toLocaleString()}</div>
                    <div style={styles.tierReward}>{tier.reward} miles</div>
                  </button>
                ))}
              </div>

              {milesEarned > 0 && (
                <div style={styles.milesEarned}>Earned: {milesEarned.toLocaleString()} miles</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '900px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#0a1a10',
    color: '#e8e8e8',
    fontFamily: '"DM Sans", sans-serif',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px',
    borderBottom: '2px solid rgba(94, 200, 80, 0.3)',
    paddingBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontFamily: '"Playfair Display", serif',
    margin: '0 0 15px 0',
    color: '#5ec850',
    fontWeight: '700'
  },
  headerStats: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  statBox: {
    padding: '12px 20px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    minWidth: '140px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#9a9a9a',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#5ec850'
  },
  filters: {
    marginBottom: '25px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '8px',
    color: '#e8e8e8',
    marginBottom: '12px',
    fontSize: '14px',
    fontFamily: '"DM Sans", sans-serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  categoryFilterContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  categoryButton: {
    padding: '8px 14px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '6px',
    color: '#c0c0c0',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
    borderColor: '#5ec850',
    color: '#5ec850',
    fontWeight: '600'
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '25px',
    padding: '16px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.15)'
  },
  catStatItem: {
    padding: '10px 12px',
    backgroundColor: 'rgba(94, 200, 80, 0.08)',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  catStatLabel: {
    color: '#5ec850',
    fontWeight: '600'
  },
  catStatValue: {
    color: '#c0c0c0'
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '16px'
  },
  achievementCard: {
    padding: '18px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  achHeader: {
    marginBottom: '14px'
  },
  achName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#e8e8e8'
  },
  achBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  categoryBadge: {
    padding: '4px 10px',
    backgroundColor: 'rgba(74, 172, 240, 0.15)',
    color: '#4aacf0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600'
  },
  repeatableBadge: {
    padding: '4px 10px',
    backgroundColor: 'rgba(212, 176, 48, 0.15)',
    color: '#d4b030',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600'
  },
  tiersContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  tierButton: {
    flex: '1',
    minWidth: '70px',
    padding: '10px 8px',
    backgroundColor: 'rgba(94, 200, 80, 0.08)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '6px',
    color: '#c0c0c0',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: '"DM Mono", monospace',
    transition: 'all 0.3s ease'
  },
  tierButtonCompleted: {
    backgroundColor: 'rgba(94, 200, 80, 0.25)',
    borderColor: '#5ec850',
    color: '#5ec850'
  },
  tierButtonActive: {
    backgroundColor: '#5ec850',
    borderColor: '#5ec850',
    color: '#0a1a10',
    fontWeight: '700'
  },
  tierTarget: {
    fontSize: '13px',
    fontWeight: '700'
  },
  tierReward: {
    fontSize: '10px',
    opacity: '0.8'
  },
  milesEarned: {
    padding: '8px 12px',
    backgroundColor: 'rgba(212, 176, 48, 0.12)',
    borderRadius: '4px',
    color: '#d4b030',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center'
  }
};
