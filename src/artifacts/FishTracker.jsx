'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const FISH_DATA = [
  { id: 1, name: "Bitterling", location: "River", shadowSize: "Tiny", sellPrice: 900, northMonths: [1,2,3,11,12], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 2, name: "Pale Chub", location: "River", shadowSize: "Tiny", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false, rarity: "Common" },
  { id: 3, name: "Crucian Carp", location: "Pond", shadowSize: "Small", sellPrice: 160, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 4, name: "Dace", location: "River", shadowSize: "Small", sellPrice: 240, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 5, name: "Carp", location: "Pond", shadowSize: "Large", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 6, name: "Koi", location: "Pond", shadowSize: "Large", sellPrice: 4000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 16, endHour: 9, allDay: false, rarity: "Uncommon" },
  { id: 7, name: "Goldfish", location: "Pond", shadowSize: "Small", sellPrice: 1300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 8, name: "Pop-eyed Goldfish", location: "Pond", shadowSize: "Small", sellPrice: 1300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 9, name: "Ranchu Goldfish", location: "Pond", shadowSize: "Small", sellPrice: 4500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false, rarity: "Rare" },
  { id: 10, name: "Killifish", location: "Pond", shadowSize: "Tiny", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 11, name: "Crawfish", location: "Pond", shadowSize: "Small", sellPrice: 200, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 12, name: "Soft-shelled Turtle", location: "River", shadowSize: "Large", sellPrice: 3750, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 13, name: "Snapping Turtle", location: "River", shadowSize: "Large", sellPrice: 5000, northMonths: [4,5,6,7,8,9,10], southMonths: [10,11,12,1,2,3,4], startHour: 21, endHour: 4, allDay: false, rarity: "Rare" },
  { id: 14, name: "Tadpole", location: "Pond", shadowSize: "Tiny", sellPrice: 100, northMonths: [3,4,5,6,7], southMonths: [9,10,11,12,1], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 15, name: "Frog", location: "Pond", shadowSize: "Small", sellPrice: 120, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 16, name: "Freshwater Goby", location: "River", shadowSize: "Tiny", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 16, endHour: 9, allDay: false, rarity: "Common" },
  { id: 17, name: "Loach", location: "River", shadowSize: "Small", sellPrice: 400, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 18, name: "Catfish", location: "Pond", shadowSize: "Large", sellPrice: 800, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 16, endHour: 9, allDay: false, rarity: "Common" },
  { id: 19, name: "Giant Snakehead", location: "Pond", shadowSize: "Large", sellPrice: 5500, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 20, name: "Bluegill", location: "Pond", shadowSize: "Small", sellPrice: 180, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false, rarity: "Common" },
  { id: 21, name: "Yellow Perch", location: "River", shadowSize: "Small", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 22, name: "Black Bass", location: "River", shadowSize: "Large", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 23, name: "Tilapia", location: "River", shadowSize: "Medium", sellPrice: 800, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 24, name: "Pike", location: "River", shadowSize: "Very Large", sellPrice: 1800, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 25, name: "Pond Smelt", location: "River", shadowSize: "Small", sellPrice: 400, northMonths: [12,1,2], southMonths: [6,7,8], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 26, name: "Sweetfish", location: "River", shadowSize: "Small", sellPrice: 900, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 27, name: "Cherry Salmon", location: "River (Clifftop)", shadowSize: "Medium", sellPrice: 1000, northMonths: [3,4,5,6,12], southMonths: [6,9,10,11,12], startHour: 16, endHour: 9, allDay: false, rarity: "Uncommon" },
  { id: 28, name: "Char", location: "River (Clifftop)", shadowSize: "Medium", sellPrice: 3800, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false, rarity: "Rare" },
  { id: 29, name: "Golden Trout", location: "River (Clifftop)", shadowSize: "Medium", sellPrice: 15000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false, rarity: "Very Rare" },
  { id: 30, name: "Stringfish", location: "River (Clifftop)", shadowSize: "Very Large", sellPrice: 15000, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 16, endHour: 9, allDay: false, rarity: "Very Rare" },
  { id: 31, name: "Salmon", location: "River (Mouth)", shadowSize: "Large", sellPrice: 700, northMonths: [9], southMonths: [3], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 32, name: "King Salmon", location: "River (Mouth)", shadowSize: "Very Large", sellPrice: 1800, northMonths: [9], southMonths: [3], startHour: 0, endHour: 24, allDay: true, rarity: "Rare" },
  { id: 33, name: "Mitten Crab", location: "River", shadowSize: "Small", sellPrice: 2000, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 16, endHour: 9, allDay: false, rarity: "Uncommon" },
  { id: 34, name: "Guppy", location: "River", shadowSize: "Tiny", sellPrice: 1300, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 35, name: "Nibble Fish", location: "River", shadowSize: "Tiny", sellPrice: 1500, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 36, name: "Angelfish", location: "River", shadowSize: "Small", sellPrice: 3000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false, rarity: "Uncommon" },
  { id: 37, name: "Betta", location: "River", shadowSize: "Small", sellPrice: 2500, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 38, name: "Neon Tetra", location: "River", shadowSize: "Tiny", sellPrice: 500, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false, rarity: "Common" },
  { id: 39, name: "Rainbowfish", location: "River", shadowSize: "Tiny", sellPrice: 800, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 40, name: "Piranha", location: "River", shadowSize: "Small", sellPrice: 2500, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 9, endHour: 16, allDay: false, rarity: "Uncommon" },
  { id: 41, name: "Arowana", location: "River", shadowSize: "Large", sellPrice: 10000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false, rarity: "Rare" },
  { id: 42, name: "Dorado", location: "River", shadowSize: "Very Large", sellPrice: 15000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 4, endHour: 21, allDay: false, rarity: "Very Rare" },
  { id: 43, name: "Gar", location: "Pond", shadowSize: "Very Large", sellPrice: 6000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false, rarity: "Rare" },
  { id: 44, name: "Arapaima", location: "River", shadowSize: "Huge", sellPrice: 10000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false, rarity: "Very Rare" },
  { id: 45, name: "Saddled Bichir", location: "River", shadowSize: "Large", sellPrice: 4000, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 21, endHour: 4, allDay: false, rarity: "Uncommon" },
  { id: 46, name: "Sturgeon", location: "River (Mouth)", shadowSize: "Huge", sellPrice: 10000, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 47, name: "Sea Butterfly", location: "Sea", shadowSize: "Tiny", sellPrice: 1000, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 48, name: "Sea Horse", location: "Sea", shadowSize: "Tiny", sellPrice: 1100, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 49, name: "Clown Fish", location: "Sea", shadowSize: "Small", sellPrice: 650, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 50, name: "Surgeonfish", location: "Sea", shadowSize: "Small", sellPrice: 1000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 51, name: "Butterfly Fish", location: "Sea", shadowSize: "Small", sellPrice: 1000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 52, name: "Napoleonfish", location: "Sea", shadowSize: "Very Large", sellPrice: 10000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 4, endHour: 21, allDay: false, rarity: "Rare" },
  { id: 53, name: "Zebra Turkeyfish", location: "Sea", shadowSize: "Medium", sellPrice: 500, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 54, name: "Blowfish", location: "Sea", shadowSize: "Small", sellPrice: 5000, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 55, name: "Puffer Fish", location: "Sea", shadowSize: "Small", sellPrice: 250, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 56, name: "Anchovy", location: "Sea", shadowSize: "Tiny", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 4, endHour: 21, allDay: false, rarity: "Common" },
  { id: 57, name: "Horse Mackerel", location: "Sea", shadowSize: "Small", sellPrice: 150, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 58, name: "Barred Knifejaw", location: "Sea", shadowSize: "Medium", sellPrice: 5000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 59, name: "Sea Bass", location: "Sea", shadowSize: "Large", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 60, name: "Red Snapper", location: "Sea", shadowSize: "Large", sellPrice: 3000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 61, name: "Dab", location: "Sea", shadowSize: "Medium", sellPrice: 300, northMonths: [1,2,3,4,10,11,12], southMonths: [4,5,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Common" },
  { id: 62, name: "Olive Flounder", location: "Sea", shadowSize: "Very Large", sellPrice: 800, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 16, endHour: 9, allDay: false, rarity: "Uncommon" },
  { id: 63, name: "Squid", location: "Sea", shadowSize: "Medium", sellPrice: 500, northMonths: [12,1,2,3,4,5], southMonths: [6,7,8,9,10,11], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 64, name: "Moray Eel", location: "Sea", shadowSize: "Large", sellPrice: 2000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 65, name: "Ribbon Eel", location: "Sea", shadowSize: "Narrow", sellPrice: 600, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 9, endHour: 16, allDay: false, rarity: "Rare" },
  { id: 66, name: "Tuna", location: "Pier", shadowSize: "Huge", sellPrice: 7000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 67, name: "Blue Marlin", location: "Pier", shadowSize: "Huge", sellPrice: 10000, northMonths: [1,2,3,4,8,9,10,11,12], southMonths: [2,3,5,6,7,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Very Rare" },
  { id: 68, name: "Giant Trevally", location: "Pier", shadowSize: "Very Large", sellPrice: 4500, northMonths: [5,6,7,8,9,10,11,12], southMonths: [11,12,1,2,3,4,5,6], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 69, name: "Mahi-Mahi", location: "Pier", shadowSize: "Very Large", sellPrice: 6000, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 70, name: "Ocean Sunfish", location: "Sea", shadowSize: "Huge", sellPrice: 4000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 4, endHour: 21, allDay: false, rarity: "Uncommon" },
  { id: 71, name: "Ray", location: "Sea", shadowSize: "Large", sellPrice: 3000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 72, name: "Saw Shark", location: "Sea", shadowSize: "Large", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false, rarity: "Very Rare" },
  { id: 73, name: "Hammerhead Shark", location: "Sea", shadowSize: "Large", sellPrice: 8000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 16, endHour: 9, allDay: false, rarity: "Rare" },
  { id: 74, name: "Great White Shark", location: "Sea", shadowSize: "Very Large", sellPrice: 15000, northMonths: [6,7,8,9,10,11], southMonths: [12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false, rarity: "Very Rare" },
  { id: 75, name: "Whale Shark", location: "Sea", shadowSize: "Huge", sellPrice: 13000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true, rarity: "Very Rare" },
  { id: 76, name: "Suckerfish", location: "Sea", shadowSize: "Large", sellPrice: 1500, northMonths: [5,6,7,8,9,10,11], southMonths: [11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 77, name: "Football Fish", location: "Sea", shadowSize: "Large", sellPrice: 2500, northMonths: [1,2,3,4], southMonths: [7,8,9,10], startHour: 16, endHour: 9, allDay: false, rarity: "Rare" },
  { id: 78, name: "Oarfish", location: "Sea", shadowSize: "Huge", sellPrice: 9000, northMonths: [12,1,2,3,4,5], southMonths: [6,7,8,9,10,11], startHour: 0, endHour: 24, allDay: true, rarity: "Uncommon" },
  { id: 79, name: "Barreleye", location: "Sea", shadowSize: "Small", sellPrice: 15000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 21, endHour: 4, allDay: false, rarity: "Very Rare" },
  { id: 80, name: "Coelacanth", location: "Sea", shadowSize: "Very Large", sellPrice: 15000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, rarity: "Very Rare" }
];

const LOCATION_EMOJI = {
  "River": "🏞️",
  "Pond": "🏞️",
  "Sea": "🌊",
  "Pier": "⚓",
  "River (Clifftop)": "⛰️",
  "River (Mouth)": "🏞️"
};

const RARITY_COLORS = {
  "Common": "#8fbc8f",
  "Uncommon": "#5ec850",
  "Rare": "#4aacf0",
  "Very Rare": "#d4b030"
};

const RARITY_BG = {
  "Common": "rgba(143, 188, 143, 0.2)",
  "Uncommon": "rgba(94, 200, 80, 0.2)",
  "Rare": "rgba(74, 172, 240, 0.2)",
  "Very Rare": "rgba(160, 100, 220, 0.2)"
};

const RARITY_BORDER = {
  "Common": "rgba(143, 188, 143, 0.5)",
  "Uncommon": "rgba(94, 200, 80, 0.5)",
  "Rare": "rgba(74, 172, 240, 0.5)",
  "Very Rare": "rgba(160, 100, 220, 0.5)"
};

const RARITY_TEXT = {
  "Common": "#8fbc8f",
  "Uncommon": "#5ec850",
  "Rare": "#4aacf0",
  "Very Rare": "#a064dc"
};

const FishTracker = () => {
  const [hemisphere, setHemisphere] = useState("north");
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [caughtFish, setCaughtFish] = useState({});
  const [donatedFish, setDonatedFish] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFish, setSelectedFish] = useState(null);
  const [fishDetails, setFishDetails] = useState(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const caughtResult = await window.storage.get("acnh-fish-tracker-caught");
        const donatedResult = await window.storage.get("acnh-fish-tracker-donated");
        const hemisphereResult = await window.storage.get("acnh-fish-tracker-hemisphere");

        if (caughtResult) setCaughtFish(JSON.parse(caughtResult.value));
        if (donatedResult) setDonatedFish(JSON.parse(donatedResult.value));
        if (hemisphereResult) setHemisphere(hemisphereResult.value);
      } catch (e) {
        console.log("Storage not available, using defaults");
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await window.storage.set("acnh-fish-tracker-caught", JSON.stringify(caughtFish));
        await window.storage.set("acnh-fish-tracker-donated", JSON.stringify(donatedFish));
        await window.storage.set("acnh-fish-tracker-hemisphere", hemisphere);
      } catch (e) {
        console.log("Could not save to storage");
      }
    };
    if (!loading) saveData();
  }, [caughtFish, donatedFish, hemisphere, loading]);

  // Drawer: fetch enriched data from Nookipedia proxy
  useEffect(() => {
    if (selectedFish) {
      setFishDetails(null);
      fetch(`/api/nookipedia/nh/fish/${encodeURIComponent(selectedFish.name)}`)
        .then(res => res.ok ? res.json() : null)
        .then(setFishDetails)
        .catch(() => setFishDetails(null));
    }
  }, [selectedFish]);

  // Drawer: Escape key to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (selectedFish) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedFish]);

  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setSelectedFish(null);
      setFishDetails(null);
      setIsDrawerClosing(false);
    }, 200);
  };

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const getCurrentHour = () => new Date().getHours();

  const isAvailableNow = (fish) => {
    const currentMonth = getCurrentMonth();
    const currentHour = getCurrentHour();
    const months = hemisphere === "north" ? fish.northMonths : fish.southMonths;

    if (!months.includes(currentMonth)) return false;

    if (fish.allDay) return true;

    if (fish.startHour < fish.endHour) {
      return currentHour >= fish.startHour && currentHour < fish.endHour;
    } else {
      return currentHour >= fish.startHour || currentHour < fish.endHour;
    }
  };

  const getAvailableMonths = (fish) => {
    return hemisphere === "north" ? fish.northMonths : fish.southMonths;
  };

  const filterFish = () => {
    return FISH_DATA.filter(fish => {
      const matchesSearch = fish.name.toLowerCase().includes(searchText.toLowerCase());

      const matchesLocation =
        locationFilter === "All" ||
        (locationFilter === "River" && fish.location.includes("River")) ||
        (locationFilter === "Pond" && fish.location === "Pond") ||
        (locationFilter === "Sea" && fish.location === "Sea") ||
        (locationFilter === "Pier" && fish.location === "Pier");

      let matchesAvailability = availabilityFilter === "All";
      if (availabilityFilter === "Available Now") {
        matchesAvailability = isAvailableNow(fish);
      } else if (availabilityFilter === "Not Yet Caught") {
        matchesAvailability = !caughtFish[fish.id];
      }

      return matchesSearch && matchesLocation && matchesAvailability;
    });
  };

  const filteredFish = filterFish();
  const caughtCount = Object.values(caughtFish).filter(Boolean).length;
  const donatedCount = Object.values(donatedFish).filter(Boolean).length;
  const completionPercent = Math.round((caughtCount / FISH_DATA.length) * 100);

  const toggleCaught = (id) => {
    setCaughtFish(prev => ({
      ...prev,
      [id]: prev[id] ? undefined : true
    }));
  };

  const toggleDonated = (id) => {
    setDonatedFish(prev => ({
      ...prev,
      [id]: prev[id] ? undefined : true
    }));
  };

  if (loading) {
    return <div style={{ color: "#5ec850", textAlign: "center", padding: "20px" }}>Loading...</div>;
  }

  const containerStyle = {
    width: "100%",
    margin: "0 auto",
    backgroundColor: "#0a1a10",
    color: "#c8e6c0",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #0a1a10 0%, #142818 100%)",
    padding: "24px",
    borderBottom: "2px solid #5ec850",
    textAlign: "center"
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 16px 0",
    color: "#5ec850"
  };

  const progressBarContainerStyle = {
    background: "rgba(255,255,255,0.1)",
    height: "8px",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "12px"
  };

  const progressBarStyle = {
    height: "100%",
    width: `${completionPercent}%`,
    background: `linear-gradient(90deg, #5ec850, #d4b030)`,
    transition: "width 0.3s ease"
  };

  const controlsStyle = {
    padding: "20px",
    backgroundColor: "rgba(12,28,14,0.5)",
    borderBottom: "1px solid rgba(94,200,80,0.2)"
  };

  const searchBoxStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(94,200,80,0.3)",
    borderRadius: "6px",
    color: "#c8e6c0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px"
  };

  const filterGroupStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px"
  };

  const selectStyle = {
    padding: "8px 12px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(94,200,80,0.3)",
    borderRadius: "6px",
    color: "#c8e6c0",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    cursor: "pointer",
    flex: 1,
    minWidth: "120px"
  };

  const hemisphereButtonStyle = (isActive) => ({
    padding: "8px 16px",
    backgroundColor: isActive ? "#5ec850" : "rgba(255,255,255,0.08)",
    color: isActive ? "#0a1a10" : "#c8e6c0",
    border: `1px solid ${isActive ? "#5ec850" : "rgba(94,200,80,0.3)"}`,
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s ease"
  });

  const statsRowStyle = {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid rgba(94,200,80,0.2)",
    fontSize: "12px"
  };

  const fishGridStyle = {
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    maxHeight: "700px",
    overflowY: "auto"
  };

  const fishCardStyle = (isAvailable) => ({
    backgroundColor: "rgba(12,28,14,0.95)",
    border: `1px solid ${isAvailable ? "rgba(94,200,80,0.5)" : "rgba(94,200,80,0.15)"}`,
    borderRadius: "8px",
    padding: "16px",
    transition: "all 0.2s ease",
    boxShadow: isAvailable ? "0 0 16px rgba(94,200,80,0.2)" : "none",
    cursor: "pointer"
  });

  const fishNameStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  const fishDetailStyle = {
    fontSize: "12px",
    color: "#5a7a50",
    marginBottom: "8px",
    fontFamily: "'DM Mono', monospace"
  };

  const monthRowStyle = {
    display: "flex",
    gap: "4px",
    marginBottom: "10px"
  };

  const monthCircleStyle = (isAvailable) => ({
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: isAvailable ? "#5ec850" : "rgba(94,200,80,0.2)",
    fontSize: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  const checkboxContainerStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(94,200,80,0.15)"
  };

  const checkboxStyle = (isChecked) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    cursor: "pointer",
    opacity: isChecked ? 1 : 0.7,
    color: isChecked ? "#5ec850" : "#5a7a50"
  });

  const statsPanelStyle = {
    padding: "20px",
    backgroundColor: "rgba(12,28,14,0.8)",
    borderTop: "2px solid #5ec850",
    display: "flex",
    justifyContent: "space-around",
    fontSize: "14px",
    fontWeight: "600"
  };

  const statItemStyle = {
    textAlign: "center"
  };

  const statValueStyle = {
    fontSize: "24px",
    color: "#d4b030",
    fontFamily: "'DM Mono', monospace"
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

        input:focus, select:focus {
          outline: none;
          box-shadow: 0 0 8px rgba(94, 200, 80, 0.4);
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(94, 200, 80, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(94, 200, 80, 0.4);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(94, 200, 80, 0.6);
        }

        @keyframes fishDrawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fishDrawerSlideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
        @keyframes fishFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fishFadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      <div style={headerStyle}>
        <div style={titleStyle}>🎣 Fish Tracker</div>
        <div style={{ fontSize: "13px", color: "#5a7a50", marginBottom: "12px" }}>
          Complete your Critterpedia
        </div>
        <div style={progressBarContainerStyle}>
          <div style={progressBarStyle} />
        </div>
        <div style={{ fontSize: "11px", color: "#5ec850", marginTop: "8px" }}>
          {caughtCount} / {FISH_DATA.length} caught ({completionPercent}%)
        </div>
      </div>

      <div style={controlsStyle}>
        <input
          type="text"
          placeholder="Search fish name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={searchBoxStyle}
        />

        <div style={filterGroupStyle}>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={selectStyle}>
            <option value="All">📍 All Locations</option>
            <option value="River">🏞️ River</option>
            <option value="Pond">🌊 Pond</option>
            <option value="Sea">🌊 Sea</option>
            <option value="Pier">⚓ Pier</option>
          </select>

          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Fish</option>
            <option value="Available Now">✨ Available Now</option>
            <option value="Not Yet Caught">🎯 Not Yet Caught</option>
          </select>
        </div>

        <div style={filterGroupStyle}>
          <button
            onClick={() => setHemisphere("north")}
            style={hemisphereButtonStyle(hemisphere === "north")}
          >
            🌍 Northern
          </button>
          <button
            onClick={() => setHemisphere("south")}
            style={hemisphereButtonStyle(hemisphere === "south")}
          >
            🌏 Southern
          </button>
        </div>

        <div style={statsRowStyle}>
          <span>✓ Caught: {caughtCount}</span>
          <span>🏛️ Donated: {donatedCount}</span>
          <span>⏱️ Current: {new Date().toLocaleString('en-US', { month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>

      <div style={fishGridStyle}>
        {filteredFish.length > 0 ? (
          filteredFish.map(fish => {
            const isCaught = caughtFish[fish.id];
            const isDonated = donatedFish[fish.id];
            const isAvailable = isAvailableNow(fish);
            const availableMonths = getAvailableMonths(fish);

            return (
              <div
                key={fish.id}
                style={{
                  ...fishCardStyle(isAvailable),
                  opacity: isCaught ? 0.75 : 1
                }}
                onClick={() => setSelectedFish(fish)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#5ec850";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isAvailable ? "rgba(94,200,80,0.5)" : "rgba(94,200,80,0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={fishNameStyle}>
                  <AssetImg category="fish" name={fish.name} size={32} />
                  {fish.name}
                </div>

                <div style={fishDetailStyle}>
                  {LOCATION_EMOJI[fish.location]} {fish.location}
                </div>

                <div style={fishDetailStyle}>
                  💰 {fish.sellPrice.toLocaleString()} bells
                </div>

                <div style={fishDetailStyle}>
                  Shadow: {fish.shadowSize}
                </div>

                <div style={fishDetailStyle}>
                  Rarity: <span style={{ color: RARITY_COLORS[fish.rarity] }}>{fish.rarity}</span>
                </div>

                {!fish.allDay && (
                  <div style={fishDetailStyle}>
                    ⏰ {fish.startHour}:00 - {fish.endHour}:00
                  </div>
                )}

                <div style={monthRowStyle}>
                  {MONTHS.map((month, idx) => (
                    <div
                      key={idx}
                      style={monthCircleStyle(availableMonths.includes(idx + 1))}
                      title={month}
                    />
                  ))}
                </div>

                <div style={checkboxContainerStyle}>
                  <label style={checkboxStyle(isCaught)} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isCaught || false}
                      onChange={() => toggleCaught(fish.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer" }}
                    />
                    Caught
                  </label>
                  <label style={checkboxStyle(isDonated)} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isDonated || false}
                      onChange={() => toggleDonated(fish.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer" }}
                    />
                    Donated
                  </label>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "#5ec850" }}>
            No fish found matching your filters.
          </div>
        )}
      </div>

      <div style={statsPanelStyle}>
        <div style={statItemStyle}>
          <div style={{ color: "#5a7a50", marginBottom: "4px" }}>Total Caught</div>
          <div style={statValueStyle}>{caughtCount}</div>
        </div>
        <div style={statItemStyle}>
          <div style={{ color: "#5a7a50", marginBottom: "4px" }}>Total Donated</div>
          <div style={statValueStyle}>{donatedCount}</div>
        </div>
        <div style={statItemStyle}>
          <div style={{ color: "#5a7a50", marginBottom: "4px" }}>Completion</div>
          <div style={statValueStyle}>{completionPercent}%</div>
        </div>
      </div>

      {selectedFish && (() => {
        const fish = selectedFish;
        const isCaught = caughtFish[fish.id];
        const isDonated = donatedFish[fish.id];
        const availableMonths = getAvailableMonths(fish);
        const hoursText = fish.allDay ? 'All Day' : `${fish.startHour}:00 - ${fish.endHour}:00`;

        return (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9999,
                animation: isDrawerClosing ? 'fishFadeOut 0.2s ease-in forwards' : 'fishFadeIn 0.2s ease-out forwards',
              }}
              onClick={closeDrawer}
            />
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: typeof window !== 'undefined' && window.innerWidth < 600 ? '100%' : '420px',
              backgroundColor: '#0a1a10',
              borderLeft: '1px solid rgba(94, 200, 80, 0.3)',
              zIndex: 10000,
              overflowY: 'auto',
              padding: '24px',
              animation: isDrawerClosing ? 'fishDrawerSlideOut 0.2s ease-in forwards' : 'fishDrawerSlideIn 0.25s ease-out forwards',
            }}>
              {/* Close button */}
              <button
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(94, 200, 80, 0.1)',
                  border: '1px solid rgba(94, 200, 80, 0.3)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c8e6c0',
                  fontSize: '18px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onClick={closeDrawer}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'; }}
              >
                ✕
              </button>

              {/* Large fish sprite */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '20px' }}>
                <AssetImg category="fish" name={fish.name} size={200} />
              </div>

              {/* Fish name */}
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: '700',
                color: '#5ec850',
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                {fish.name}
              </div>

              {/* Rarity badge */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: RARITY_BG[fish.rarity],
                  border: `1px solid ${RARITY_BORDER[fish.rarity]}`,
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: RARITY_TEXT[fish.rarity],
                }}>
                  {fish.rarity}
                </span>
              </div>

              {/* Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{LOCATION_EMOJI[fish.location]} {fish.location}</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Shadow</div>
                  <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{fish.shadowSize}</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell (Nook)</div>
                  <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{fish.sellPrice.toLocaleString()} Bells</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell (C.J.)</div>
                  <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>
                    {fishDetails ? (fishDetails.sell_cj ? `${Number(fishDetails.sell_cj).toLocaleString()} Bells` : '---') : (
                      <span style={{ color: '#5a7a50', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif", fontWeight: '400' }}>Loading...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Availability section */}
              <div style={{
                marginBottom: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(94, 200, 80, 0.1)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Availability</div>

                <div style={{ fontSize: '14px', color: '#c8e6c0', marginBottom: '16px' }}>
                  ⏰ {hoursText}
                </div>

                {/* North months */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '6px' }}>🌍 Northern Hemisphere</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {MONTHS.map((month, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: fish.northMonths.includes(idx + 1) ? '#5ec850' : 'rgba(94,200,80,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: fish.northMonths.includes(idx + 1) ? '#0a1a10' : '#5a7a50',
                          fontWeight: '600',
                        }}>
                          {month.charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* South months */}
                <div>
                  <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '6px' }}>🌏 Southern Hemisphere</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {MONTHS.map((month, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: fish.southMonths.includes(idx + 1) ? '#5ec850' : 'rgba(94,200,80,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: fish.southMonths.includes(idx + 1) ? '#0a1a10' : '#5a7a50',
                          fontWeight: '600',
                        }}>
                          {month.charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catchphrase from API */}
              {fishDetails?.catchphrases?.[0] && (
                <div style={{
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(94, 200, 80, 0.1)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Catchphrase</div>
                  <div style={{
                    fontStyle: 'italic',
                    color: '#d4b030',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: 'rgba(212, 176, 48, 0.06)',
                    border: '1px solid rgba(212, 176, 48, 0.15)',
                    borderRadius: '8px',
                  }}>
                    &ldquo;{fishDetails.catchphrases[0]}&rdquo;
                  </div>
                </div>
              )}

              {/* Tank size from API */}
              {fishDetails && (fishDetails.tank_width || fishDetails.tank_length) && (
                <div style={{
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(94, 200, 80, 0.1)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tank Size</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#4aacf0',
                    fontFamily: "'DM Mono', monospace",
                    padding: '12px',
                    backgroundColor: 'rgba(74, 172, 240, 0.06)',
                    border: '1px solid rgba(74, 172, 240, 0.15)',
                    borderRadius: '8px',
                  }}>
                    {fishDetails.tank_width} x {fishDetails.tank_length}
                  </div>
                </div>
              )}

              {/* Caught/Donated checkboxes */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(94, 200, 80, 0.1)',
              }}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px',
                    backgroundColor: 'rgba(94, 200, 80, 0.06)',
                    border: '1px solid rgba(94, 200, 80, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onClick={() => toggleCaught(fish.id)}
                >
                  <input
                    type="checkbox"
                    checked={isCaught || false}
                    onChange={() => toggleCaught(fish.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '22px', height: '22px', cursor: 'pointer', outline: 'none', accentColor: '#5ec850' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isCaught ? '#5ec850' : '#c8e6c0' }}>
                    {isCaught ? '✅ Caught' : 'Mark Caught'}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px',
                    backgroundColor: 'rgba(94, 200, 80, 0.06)',
                    border: '1px solid rgba(94, 200, 80, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onClick={() => toggleDonated(fish.id)}
                >
                  <input
                    type="checkbox"
                    checked={isDonated || false}
                    onChange={() => toggleDonated(fish.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '22px', height: '22px', cursor: 'pointer', outline: 'none', accentColor: '#5ec850' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isDonated ? '#5ec850' : '#c8e6c0' }}>
                    {isDonated ? '🏛️ Donated' : 'Mark Donated'}
                  </span>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default FishTracker;
