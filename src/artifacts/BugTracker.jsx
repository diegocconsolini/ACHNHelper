'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const BUG_DATA = [
  { id: 1, name: "Common Butterfly", location: "Flowers", sellPrice: 160, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Found near flowers during daytime" },
  { id: 2, name: "Yellow Butterfly", location: "Flowers", sellPrice: 160, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Attracted to yellow flowers" },
  { id: 3, name: "Tiger Butterfly", location: "Flowers", sellPrice: 240, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Found near flowers during daytime" },
  { id: 4, name: "Peacock Butterfly", location: "Flowers", sellPrice: 2500, northMonths: [2,3,4,5,6,7,8,9,10], southMonths: [4,5,8,9,10,11,12,1], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Rare butterfly near flowers" },
  { id: 5, name: "Common Bluebottle", location: "Flowers", sellPrice: 300, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Found near flowers in spring-summer" },
  { id: 6, name: "Paper Kite Butterfly", location: "Flowers", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Available most of the year near flowers" },
  { id: 7, name: "Great Purple Emperor", location: "Flying", sellPrice: 3000, northMonths: [4,5,6,7,8], southMonths: [10,11,12,1,2], startHour: 12, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Rare butterfly found flying between trees" },
  { id: 8, name: "Monarch Butterfly", location: "Flowers", sellPrice: 140, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 4, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Migrates during fall months near flowers" },
  { id: 9, name: "Emperor Butterfly", location: "Flying", sellPrice: 4000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 17, endHour: 8, allDay: false, specialCondition: null, farmingTip: "Rare nighttime butterfly flying between trees" },
  { id: 10, name: "Agrias Butterfly", location: "Flowers", sellPrice: 3000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Rare tropical butterfly near flowers" },
  { id: 11, name: "Rajah Brooke's Birdwing", location: "Flowers", sellPrice: 1500, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 16, allDay: false, specialCondition: null, farmingTip: "Large butterfly near flowers" },
  { id: 12, name: "Queen Alexandra's Birdwing", location: "Flowers", sellPrice: 3000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 8, endHour: 16, allDay: false, specialCondition: null, farmingTip: "Very rare large butterfly near flowers" },
  { id: 13, name: "Moth", location: "Lights", sellPrice: 130, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 19, endHour: 4, allDay: false, specialCondition: "Near lights at night", farmingTip: "Found around outdoor lights at night" },
  { id: 14, name: "Atlas Moth", location: "Trees", sellPrice: 3000, northMonths: [4,5,6,7], southMonths: [10,11,12,1], startHour: 19, endHour: 4, allDay: false, specialCondition: "Near lights at night", farmingTip: "Rare large moth near lights" },
  { id: 15, name: "Madagascan Sunset Moth", location: "Flowers", sellPrice: 2500, northMonths: [1,2,3,12], southMonths: [6,7,8,9], startHour: 8, endHour: 16, allDay: false, specialCondition: null, farmingTip: "Colorful moth near flowers in specific months" },
  { id: 16, name: "Long Locust", location: "Grass", sellPrice: 200, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 8, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Found in grass during late summer-fall" },
  { id: 17, name: "Migratory Locust", location: "Grass", sellPrice: 600, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Common in grass during fall" },
  { id: 18, name: "Rice Grasshopper", location: "Grass", sellPrice: 400, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 8, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Found in grass during fall months" },
  { id: 19, name: "Grasshopper", location: "Grass", sellPrice: 160, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 8, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Common in grass during summer-fall" },
  { id: 20, name: "Cricket", location: "Grass", sellPrice: 130, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 17, endHour: 8, allDay: false, specialCondition: null, farmingTip: "Found in grass at night during fall" },
  { id: 21, name: "Bell Cricket", location: "Grass", sellPrice: 430, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 17, endHour: 8, allDay: false, specialCondition: null, farmingTip: "Nighttime cricket in grass" },
  { id: 22, name: "Mantis", location: "Flowers", sellPrice: 430, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Found near flowers during daytime" },
  { id: 23, name: "Orchid Mantis", location: "Flowers", sellPrice: 2400, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Rare mantis found near flowers" },
  { id: 24, name: "Honeybee", location: "Flowers", sellPrice: 200, northMonths: [3,4,5,6,7], southMonths: [9,10,11,12,1], startHour: 8, endHour: 17, allDay: false, specialCondition: "Chases you if disturbed", farmingTip: "Shake flowers to find" },
  { id: 25, name: "Wasp", location: "Trees", sellPrice: 2500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Shake trees to find", farmingTip: "Shake trees and catch immediately" },
  { id: 26, name: "Brown Cicada", location: "Trees", sellPrice: 250, northMonths: [7,8], southMonths: [1,2], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "On tree trunks during summer" },
  { id: 27, name: "Robust Cicada", location: "Trees", sellPrice: 300, northMonths: [7,8], southMonths: [1,2], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Rare on tree trunks during summer" },
  { id: 28, name: "Giant Cicada", location: "Trees", sellPrice: 500, northMonths: [8,9], southMonths: [2,3], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Large rare cicada on tree trunks" },
  { id: 29, name: "Walker Cicada", location: "Trees", sellPrice: 400, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Found on tree trunks during summer" },
  { id: 30, name: "Evening Cicada", location: "Trees", sellPrice: 550, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 4, endHour: 8, allDay: false, specialCondition: null, farmingTip: "On tree trunks in early morning" },
  { id: 31, name: "Cicada Shell", location: "Trees", sellPrice: 10, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Collected on tree trunks" },
  { id: 32, name: "Red Dragonfly", location: "Flying", sellPrice: 180, northMonths: [9,10], southMonths: [3,4], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Flying near water in fall" },
  { id: 33, name: "Darner Dragonfly", location: "Flying", sellPrice: 230, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 4, endHour: 19, allDay: false, specialCondition: null, farmingTip: "Common flying insects" },
  { id: 34, name: "Banded Dragonfly", location: "Flying", sellPrice: 4500, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 8, endHour: 16, allDay: false, specialCondition: null, farmingTip: "Rare large dragonfly" },
  { id: 35, name: "Damselfly", location: "Flying", sellPrice: 500, northMonths: [5,6,7,8,9,10,11], southMonths: [11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Common flying near water" },
  { id: 36, name: "Firefly", location: "Flying", sellPrice: 300, northMonths: [6,7], southMonths: [12,1], startHour: 19, endHour: 4, allDay: false, specialCondition: null, farmingTip: "Flying at night during early summer" },
  { id: 37, name: "Mole Cricket", location: "Underground", sellPrice: 500, northMonths: [1,2,11,12], southMonths: [5,6,7,8], startHour: 0, endHour: 24, allDay: true, specialCondition: "Listen for chirping, dig with shovel", farmingTip: "Underground, listen for noise" },
  { id: 38, name: "Pondskater", location: "Water", sellPrice: 130, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: "On water surface", farmingTip: "Skating on water surface" },
  { id: 39, name: "Diving Beetle", location: "Water", sellPrice: 800, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 8, endHour: 19, allDay: false, specialCondition: "In water", farmingTip: "Swimming in ponds and rivers" },
  { id: 40, name: "Giant Water Bug", location: "Water", sellPrice: 2000, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 19, endHour: 8, allDay: false, specialCondition: "In water", farmingTip: "Rare in water at night" },
  { id: 41, name: "Stinkbug", location: "Flowers", sellPrice: 120, northMonths: [3,4,9,10,11,12], southMonths: [9,10,3,4,5,6], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Found on flowers and trees" },
  { id: 42, name: "Man-faced Stink Bug", location: "Flowers", sellPrice: 1000, northMonths: [3,4,5,6,7,8,9,10,11,12], southMonths: [3,4,9,10,11,12], startHour: 19, endHour: 8, allDay: false, specialCondition: null, farmingTip: "Nighttime bug on flowers" },
  { id: 43, name: "Ladybug", location: "Flowers", sellPrice: 200, northMonths: [1,2,3,4,12], southMonths: [6,7,8,9,10], startHour: 8, endHour: 17, allDay: false, specialCondition: null, farmingTip: "Found on flowers and trees" },
  { id: 44, name: "Tiger Beetle", location: "Ground", sellPrice: 1500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Fast-moving on the ground" },
  { id: 45, name: "Jewel Beetle", location: "Trees", sellPrice: 2400, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "On tree trunks" },
  { id: 46, name: "Violin Beetle", location: "Logs", sellPrice: 450, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Found on wood/logs" },
  { id: 47, name: "Citrus Long-horned Beetle", location: "Trees", sellPrice: 350, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "On tree trunks year-round" },
  { id: 48, name: "Rosalia Batesi Beetle", location: "Logs", sellPrice: 3000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Rare on logs and stumps" },
  { id: 49, name: "Blue Weevil Beetle", location: "Trees", sellPrice: 800, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Blue-colored on tree trunks" },
  { id: 50, name: "Dung Beetle", location: "Ground", sellPrice: 3000, northMonths: [1,2,12], southMonths: [6,7,8], startHour: 0, endHour: 24, allDay: true, specialCondition: "Found rolling snowballs during winter", farmingTip: "Rare rolling ball on ground" },
  { id: 51, name: "Earth-boring Dung Beetle", location: "Ground", sellPrice: 300, northMonths: [7,8,9,10,11,12], southMonths: [1,2,3,4,5,6], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Rare on ground" },
  { id: 52, name: "Scarab Beetle", location: "Ground", sellPrice: 10000, northMonths: [7,8,9,10], southMonths: [1,2,3,4], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Very rare rolling ball on ground" },
  { id: 53, name: "Drone Beetle", location: "Trees", sellPrice: 200, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Common on tree trunks" },
  { id: 54, name: "Goliath Beetle", location: "Trees", sellPrice: 8000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Very rare large beetle on trees" },
  { id: 55, name: "Saw Stag", location: "Trees", sellPrice: 2000, northMonths: [1,2,7,8,9,10,11,12], southMonths: [1,2,3,4,5,7,8], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "On tree trunks" },
  { id: 56, name: "Miyama Stag", location: "Trees", sellPrice: 1000, northMonths: [1,2,3,4,10,11,12], southMonths: [4,5,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "On tree trunks in cool months" },
  { id: 57, name: "Giant Stag", location: "Trees", sellPrice: 10000, northMonths: [7,8], southMonths: [1,2], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Very rare large stag beetle" },
  { id: 58, name: "Rainbow Stag", location: "Trees", sellPrice: 6000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Rare colorful stag on trees" },
  { id: 59, name: "Cyclommatus Stag", location: "Trees", sellPrice: 8000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Rare at night on trees" },
  { id: 60, name: "Golden Stag", location: "Trees", sellPrice: 12000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Very rare at night on trees" },
  { id: 61, name: "Giraffe Stag", location: "Trees", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Very rare long-horned stag" },
  { id: 62, name: "Horned Dynastid", location: "Trees", sellPrice: 1350, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Night beetle on trees" },
  { id: 63, name: "Horned Atlas", location: "Trees", sellPrice: 8000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Very rare horned beetle at night" },
  { id: 64, name: "Horned Elephant", location: "Trees", sellPrice: 8000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Very rare at night on trees" },
  { id: 65, name: "Horned Hercules", location: "Trees", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 8, allDay: false, specialCondition: null, farmingTip: "Very rare large horned beetle" },
  { id: 66, name: "Walking Leaf", location: "Trees", sellPrice: 600, northMonths: [7,8,9,10], southMonths: [1,2,3,4], startHour: 16, endHour: 9, allDay: false, specialCondition: null, farmingTip: "Camouflaged insect at night" },
  { id: 67, name: "Walking Stick", location: "Trees", sellPrice: 600, northMonths: [7,8,9,10,11], southMonths: [1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Stick-like insect" },
  { id: 68, name: "Bagworm", location: "Trees", sellPrice: 600, northMonths: [1,2,3,11,12], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "Hanging cocoon on trees" },
  { id: 69, name: "Ant", location: "Ground", sellPrice: 80, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Leave spoiled turnips or rotten fruit on ground", farmingTip: "On spoiled turnips or trash" },
  { id: 70, name: "Hermit Crab", location: "Ground", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 19, endHour: 8, allDay: false, specialCondition: "Shell on ground", farmingTip: "Shells on beach at night" },
  { id: 71, name: "Wharf Roach", location: "Ground", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "On rocks on beach" },
  { id: 72, name: "Fly", location: "Trash", sellPrice: 60, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Near garbage", farmingTip: "Around spoiled food and trash" },
  { id: 73, name: "Mosquito", location: "Flying", sellPrice: 130, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 17, endHour: 4, allDay: false, specialCondition: null, farmingTip: "Flying at night during summer" },
  { id: 74, name: "Flea", location: "Villagers", sellPrice: 70, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Check villager heads", farmingTip: "Talk to villagers to find fleas" },
  { id: 75, name: "Snail", location: "Ground", sellPrice: 250, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "On wet ground or moss", farmingTip: "Rainy day collections" },
  { id: 76, name: "Pill Bug", location: "Logs", sellPrice: 250, northMonths: [1,2,3,9,10,11,12], southMonths: [3,4,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Under logs", farmingTip: "Roll/destroy wood pieces" },
  { id: 77, name: "Centipede", location: "Logs", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: "Under logs", farmingTip: "Under rotting wood" },
  { id: 78, name: "Spider", location: "Webs", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, specialCondition: null, farmingTip: "In spider webs" },
  { id: 79, name: "Tarantula", location: "Ground", sellPrice: 8000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 19, endHour: 4, allDay: false, specialCondition: null, farmingTip: "Rare at night, fast moving" },
  { id: 80, name: "Scorpion", location: "Ground", sellPrice: 8000, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 19, endHour: 4, allDay: false, specialCondition: null, farmingTip: "Rare at night, very fast" }
];

const LOCATION_EMOJI = {
  "Flowers": "🌸",
  "Trees": "🌳",
  "Flying": "✈️",
  "Ground": "🌍",
  "Grass": "🌿",
  "Water": "💧",
  "Lights": "💡",
  "Underground": "⛏️",
  "Logs": "🪵",
  "Trash": "🗑️",
  "Webs": "🕸️",
  "Villagers": "🏘️"
};

const BUG_EMOJI = "🐛";

export default function BugTracker() {
  const [hemisphere, setHemisphere] = useState("north");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [caughtBugs, setCaughtBugs] = useState({});
  const [donatedBugs, setDonatedBugs] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const caughtResult = await window.storage.get('acnh-bug-tracker-caught');
        const donatedResult = await window.storage.get('acnh-bug-tracker-donated');
        if (caughtResult) setCaughtBugs(JSON.parse(caughtResult.value));
        if (donatedResult) setDonatedBugs(JSON.parse(donatedResult.value));
      } catch (e) {
        console.log('Storage not available');
      }
    };
    loadData();
  }, []);

  const saveData = async (caught, donated) => {
    try {
      await window.storage.set('acnh-bug-tracker-caught', JSON.stringify(caught));
      await window.storage.set('acnh-bug-tracker-donated', JSON.stringify(donated));
    } catch (e) {
      console.log('Storage save failed');
    }
  };

  const toggleCaught = (bugId) => {
    const newCaught = { ...caughtBugs, [bugId]: !caughtBugs[bugId] };
    setCaughtBugs(newCaught);
    saveData(newCaught, donatedBugs);
  };

  const toggleDonated = (bugId) => {
    const newDonated = { ...donatedBugs, [bugId]: !donatedBugs[bugId] };
    setDonatedBugs(newDonated);
    saveData(caughtBugs, newDonated);
  };

  const isAvailableNow = (bug) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentHour = new Date().getHours();
    const months = hemisphere === "north" ? bug.northMonths : bug.southMonths;

    if (!months.includes(currentMonth)) return false;

    if (bug.allDay) return true;
    if (bug.startHour < bug.endHour) {
      return currentHour >= bug.startHour && currentHour < bug.endHour;
    } else {
      return currentHour >= bug.startHour || currentHour < bug.endHour;
    }
  };

  const getAvailableMonths = (bug) => {
    return hemisphere === "north" ? bug.northMonths : bug.southMonths;
  };

  const getMonthDots = (bug) => {
    const availableMonths = getAvailableMonths(bug);
    const dots = [];
    for (let i = 1; i <= 12; i++) {
      dots.push(availableMonths.includes(i));
    }
    return dots;
  };

  const filteredBugs = BUG_DATA.filter((bug) => {
    const matchesSearch = bug.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === "All" || bug.location === locationFilter;
    let matchesAvailability = true;

    if (availabilityFilter === "Available Now") {
      matchesAvailability = isAvailableNow(bug);
    } else if (availabilityFilter === "Not Yet Caught") {
      matchesAvailability = !caughtBugs[bug.id];
    }

    return matchesSearch && matchesLocation && matchesAvailability;
  });

  const totalCaught = Object.values(caughtBugs).filter(Boolean).length;
  const totalDonated = Object.values(donatedBugs).filter(Boolean).length;
  const completionPercent = Math.round((totalCaught / 80) * 100);

  const locations = ["All", "Flowers", "Trees", "Flying", "Ground", "Grass", "Water", "Lights", "Underground", "Logs", "Trash", "Webs", "Villagers"];

  return (
    <div style={{ ...styles.container }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <h1 style={styles.title}>Bug Tracker</h1>
        </div>
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>Progress</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${completionPercent}%` }}></div>
          </div>
          <div style={styles.progressText}>{totalCaught}/80 caught ({completionPercent}%)</div>
        </div>
      </div>

      {/* Hemisphere Toggle */}
      <div style={styles.hemisphereControl}>
        <button
          style={{ ...styles.hemButton, ...(hemisphere === "north" ? styles.hemButtonActive : styles.hemButtonInactive) }}
          onClick={() => setHemisphere("north")}
        >
          🌎 Northern
        </button>
        <button
          style={{ ...styles.hemButton, ...(hemisphere === "south" ? styles.hemButtonActive : styles.hemButtonInactive) }}
          onClick={() => setHemisphere("south")}
        >
          🌏 Southern
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search bugs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Location Filter */}
      <div style={styles.filterContainer}>
        <div style={styles.filterLabel}>Location</div>
        <div style={styles.filterButtons}>
          {locations.map((loc) => (
            <button
              key={loc}
              style={{
                ...styles.filterButton,
                ...(locationFilter === loc ? styles.filterButtonActive : styles.filterButtonInactive),
              }}
              onClick={() => setLocationFilter(loc)}
            >
              {LOCATION_EMOJI[loc]} {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div style={styles.filterContainer}>
        <div style={styles.filterLabel}>Availability</div>
        <div style={styles.filterButtonsRow}>
          {["All", "Available Now", "Not Yet Caught"].map((avail) => (
            <button
              key={avail}
              style={{
                ...styles.filterButton,
                ...(availabilityFilter === avail ? styles.filterButtonActive : styles.filterButtonInactive),
              }}
              onClick={() => setAvailabilityFilter(avail)}
            >
              {avail}
            </button>
          ))}
        </div>
      </div>

      {/* Bug Grid */}
      <div style={styles.bugGrid}>
        {filteredBugs.map((bug) => {
          const monthDots = getMonthDots(bug);
          const isAvailable = isAvailableNow(bug);

          return (
            <div
              key={bug.id}
              style={{
                ...styles.bugCard,
                ...(isAvailable ? styles.bugCardAvailable : {}),
              }}
            >
              {/* Bug Name and Location */}
              <div style={styles.bugNameSection}>
                <AssetImg category="bugs" name={bug.name} size={20} />
                <div>
                  <div style={styles.bugName}>{bug.name}</div>
                  <div style={styles.bugLocation}>
                    {LOCATION_EMOJI[bug.location]} {bug.location}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div style={styles.bugPrice}>💰 {bug.sellPrice.toLocaleString()}</div>

              {/* Special Condition */}
              {bug.specialCondition && (
                <div style={styles.specialCondition}>{bug.specialCondition}</div>
              )}

              {/* Month Dots */}
              <div style={styles.monthDotsContainer}>
                {monthDots.map((available, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.monthDot,
                      ...(available ? styles.monthDotActive : styles.monthDotInactive),
                    }}
                  ></div>
                ))}
              </div>

              {/* Hours Available */}
              {!bug.allDay && (
                <div style={styles.hoursText}>
                  ⏰ {String(bug.startHour).padStart(2, '0')}:00 - {String(bug.endHour).padStart(2, '0')}:00
                </div>
              )}
              {bug.allDay && <div style={styles.hoursText}>⏰ All day</div>}

              {/* Farming Tip */}
              <div style={styles.farmingTip}>{bug.farmingTip}</div>

              {/* Checkboxes */}
              <div style={styles.checkboxContainer}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={caughtBugs[bug.id] || false}
                    onChange={() => toggleCaught(bug.id)}
                    style={styles.checkbox}
                  />
                  Caught
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={donatedBugs[bug.id] || false}
                    onChange={() => toggleDonated(bug.id)}
                    style={styles.checkbox}
                  />
                  Donated
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Panel */}
      <div style={styles.statsPanel}>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Total Caught</div>
          <div style={styles.statValue}>{totalCaught}</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Total Donated</div>
          <div style={styles.statValue}>{totalDonated}</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Completion</div>
          <div style={styles.statValue}>{completionPercent}%</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  header: {
    marginBottom: '24px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  emoji: {
    fontSize: '40px',
  },
  title: {
    margin: 0,
    fontSize: '36px',
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    color: '#5ec850',
    letterSpacing: '2px',
  },
  progressContainer: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid rgba(94, 200, 80, 0.3)`,
  },
  progressLabel: {
    fontSize: '12px',
    color: '#5a7a50',
    fontWeight: 500,
    marginBottom: '6px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5ec850',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '11px',
    color: '#5ec850',
    fontFamily: "'DM Mono', monospace",
  },
  hemisphereControl: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  hemButton: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  hemButtonActive: {
    backgroundColor: '#5ec850',
    color: '#0a1a10',
  },
  hemButtonInactive: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    color: '#5a7a50',
    border: `1px solid rgba(94, 200, 80, 0.3)`,
  },
  searchContainer: {
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: `1px solid rgba(94, 200, 80, 0.3)`,
    borderRadius: '6px',
    color: '#c8e6c0',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  filterContainer: {
    marginBottom: '16px',
  },
  filterLabel: {
    fontSize: '12px',
    color: '#5a7a50',
    fontWeight: 500,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  filterButtonsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  filterButtonActive: {
    backgroundColor: '#5ec850',
    color: '#0a1a10',
  },
  filterButtonInactive: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    color: '#5a7a50',
    border: `1px solid rgba(94, 200, 80, 0.3)`,
  },
  bugGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  bugCard: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: `1px solid rgba(94, 200, 80, 0.2)`,
    borderRadius: '8px',
    padding: '14px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  bugCardAvailable: {
    borderColor: '#5ec850',
    boxShadow: '0 0 16px rgba(94, 200, 80, 0.3)',
    backgroundColor: 'rgba(94, 200, 80, 0.08)',
  },
  bugNameSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '8px',
  },
  bugNameEmoji: {
    fontSize: '20px',
    lineHeight: '1.4',
  },
  bugName: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#5ec850',
    marginBottom: '2px',
  },
  bugLocation: {
    fontSize: '12px',
    color: '#5a7a50',
  },
  bugPrice: {
    fontSize: '12px',
    color: '#d4b030',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '6px',
  },
  specialCondition: {
    fontSize: '11px',
    color: '#d4b030',
    fontStyle: 'italic',
    marginBottom: '6px',
  },
  monthDotsContainer: {
    display: 'flex',
    gap: '3px',
    marginBottom: '8px',
    justifyContent: 'flex-start',
  },
  monthDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.2s',
  },
  monthDotActive: {
    backgroundColor: '#5ec850',
  },
  monthDotInactive: {
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
  },
  hoursText: {
    fontSize: '11px',
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
    marginBottom: '6px',
  },
  farmingTip: {
    fontSize: '11px',
    color: '#5a7a50',
    fontStyle: 'italic',
    marginBottom: '8px',
    lineHeight: '1.3',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#5a7a50',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#5ec850',
    width: '16px',
    height: '16px',
  },
  statsPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: `1px solid rgba(94, 200, 80, 0.3)`,
    borderRadius: '8px',
    padding: '16px',
  },
  statItem: {
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#5ec850',
    fontFamily: "'DM Mono', monospace",
  },
};