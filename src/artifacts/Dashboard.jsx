'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AssetImg } from '../assetHelper';
import { VILLAGERS } from './villagerData';

// ─── Verified critter data (imported inline from existing trackers) ───────────

const FISH_DATA = [
  { id: 1, name: "Bitterling", location: "River", sellPrice: 900, northMonths: [1,2,3,11,12], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 2, name: "Pale Chub", location: "River", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false },
  { id: 3, name: "Crucian Carp", location: "Pond", sellPrice: 160, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 4, name: "Dace", location: "River", sellPrice: 240, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 5, name: "Carp", location: "Pond", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 6, name: "Koi", location: "Pond", sellPrice: 4000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 16, endHour: 9, allDay: false },
  { id: 7, name: "Goldfish", location: "Pond", sellPrice: 1300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 8, name: "Pop-eyed Goldfish", location: "Pond", sellPrice: 1300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false },
  { id: 9, name: "Ranchu Goldfish", location: "Pond", sellPrice: 4500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false },
  { id: 10, name: "Killifish", location: "Pond", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 11, name: "Crawfish", location: "Pond", sellPrice: 200, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 12, name: "Soft-shelled Turtle", location: "River", sellPrice: 3750, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 13, name: "Snapping Turtle", location: "River", sellPrice: 5000, northMonths: [4,5,6,7,8,9,10], southMonths: [10,11,12,1,2,3,4], startHour: 21, endHour: 4, allDay: false },
  { id: 14, name: "Tadpole", location: "Pond", sellPrice: 100, northMonths: [3,4,5,6,7], southMonths: [9,10,11,12,1], startHour: 0, endHour: 24, allDay: true },
  { id: 15, name: "Frog", location: "Pond", sellPrice: 120, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 0, endHour: 24, allDay: true },
  { id: 16, name: "Freshwater Goby", location: "River", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 16, endHour: 9, allDay: false },
  { id: 17, name: "Loach", location: "River", sellPrice: 400, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 18, name: "Catfish", location: "Pond", sellPrice: 800, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 16, endHour: 9, allDay: false },
  { id: 19, name: "Giant Snakehead", location: "Pond", sellPrice: 5500, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 9, endHour: 16, allDay: false },
  { id: 20, name: "Bluegill", location: "Pond", sellPrice: 180, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 9, endHour: 16, allDay: false },
  { id: 21, name: "Yellow Perch", location: "River", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 22, name: "Black Bass", location: "River", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 23, name: "Tilapia", location: "River", sellPrice: 800, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 24, name: "Pike", location: "River", sellPrice: 1800, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 25, name: "Pond Smelt", location: "River", sellPrice: 400, northMonths: [12,1,2], southMonths: [6,7,8], startHour: 0, endHour: 24, allDay: true },
  { id: 26, name: "Sweetfish", location: "River", sellPrice: 900, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 27, name: "Cherry Salmon", location: "River (Clifftop)", sellPrice: 1000, northMonths: [3,4,5,6,12], southMonths: [6,9,10,11,12], startHour: 16, endHour: 9, allDay: false },
  { id: 28, name: "Char", location: "River (Clifftop)", sellPrice: 3800, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false },
  { id: 29, name: "Golden Trout", location: "River (Clifftop)", sellPrice: 15000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false },
  { id: 30, name: "Stringfish", location: "River (Clifftop)", sellPrice: 15000, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 16, endHour: 9, allDay: false },
  { id: 31, name: "Salmon", location: "River (Mouth)", sellPrice: 700, northMonths: [9], southMonths: [3], startHour: 0, endHour: 24, allDay: true },
  { id: 32, name: "King Salmon", location: "River (Mouth)", sellPrice: 1800, northMonths: [9], southMonths: [3], startHour: 0, endHour: 24, allDay: true },
  { id: 33, name: "Mitten Crab", location: "River", sellPrice: 2000, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 16, endHour: 9, allDay: false },
  { id: 34, name: "Guppy", location: "River", sellPrice: 1300, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false },
  { id: 35, name: "Nibble Fish", location: "River", sellPrice: 1500, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 9, endHour: 16, allDay: false },
  { id: 36, name: "Angelfish", location: "River", sellPrice: 3000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 16, endHour: 9, allDay: false },
  { id: 37, name: "Betta", location: "River", sellPrice: 2500, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 9, endHour: 16, allDay: false },
  { id: 38, name: "Neon Tetra", location: "River", sellPrice: 500, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false },
  { id: 39, name: "Rainbowfish", location: "River", sellPrice: 800, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 9, endHour: 16, allDay: false },
  { id: 40, name: "Piranha", location: "River", sellPrice: 2500, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 9, endHour: 16, allDay: false },
  { id: 41, name: "Arowana", location: "River", sellPrice: 10000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 42, name: "Dorado", location: "River", sellPrice: 15000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 4, endHour: 21, allDay: false },
  { id: 43, name: "Gar", location: "Pond", sellPrice: 6000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 44, name: "Arapaima", location: "River", sellPrice: 10000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 45, name: "Saddled Bichir", location: "River", sellPrice: 4000, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 21, endHour: 4, allDay: false },
  { id: 46, name: "Sturgeon", location: "River (Mouth)", sellPrice: 10000, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 47, name: "Sea Butterfly", location: "Sea", sellPrice: 1000, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 48, name: "Sea Horse", location: "Sea", sellPrice: 1100, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 49, name: "Clown Fish", location: "Sea", sellPrice: 650, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 50, name: "Surgeonfish", location: "Sea", sellPrice: 1000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 51, name: "Butterfly Fish", location: "Sea", sellPrice: 1000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 52, name: "Napoleonfish", location: "Sea", sellPrice: 10000, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 4, endHour: 21, allDay: false },
  { id: 53, name: "Zebra Turkeyfish", location: "Sea", sellPrice: 500, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 54, name: "Blowfish", location: "Sea", sellPrice: 5000, northMonths: [1,2,3,4,9,10,11,12], southMonths: [3,4,5,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 55, name: "Puffer Fish", location: "Sea", sellPrice: 250, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 56, name: "Anchovy", location: "Sea", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 4, endHour: 21, allDay: false },
  { id: 57, name: "Horse Mackerel", location: "Sea", sellPrice: 150, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 58, name: "Barred Knifejaw", location: "Sea", sellPrice: 5000, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 59, name: "Sea Bass", location: "Sea", sellPrice: 400, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 60, name: "Red Snapper", location: "Sea", sellPrice: 3000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 61, name: "Dab", location: "Sea", sellPrice: 300, northMonths: [1,2,3,4,10,11,12], southMonths: [4,5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 62, name: "Olive Flounder", location: "Sea", sellPrice: 800, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 63, name: "Squid", location: "Sea", sellPrice: 500, northMonths: [12,1,2,3,4,5,6,7,8], southMonths: [6,7,8,9,10,11,12,1,2], startHour: 0, endHour: 24, allDay: true },
  { id: 64, name: "Moray Eel", location: "Sea", sellPrice: 2000, northMonths: [8,9,10], southMonths: [2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 65, name: "Ribbon Eel", location: "Sea", sellPrice: 600, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 66, name: "Tuna", location: "Pier", sellPrice: 7000, northMonths: [1,2,3,4,11,12], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 67, name: "Blue Marlin", location: "Pier", sellPrice: 10000, northMonths: [1,2,3,4,7,8,9,11,12], southMonths: [1,2,3,5,6,7,8,10,11], startHour: 0, endHour: 24, allDay: true },
  { id: 68, name: "Giant Trevally", location: "Pier", sellPrice: 4500, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 69, name: "Mahi-Mahi", location: "Pier", sellPrice: 6000, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 70, name: "Ocean Sunfish", location: "Sea", sellPrice: 4000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 4, endHour: 21, allDay: false },
  { id: 71, name: "Ray", location: "Sea", sellPrice: 3000, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 4, endHour: 21, allDay: false },
  { id: 72, name: "Saw Shark", location: "Sea", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 73, name: "Hammerhead Shark", location: "Sea", sellPrice: 8000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 74, name: "Great White Shark", location: "Sea", sellPrice: 15000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 75, name: "Whale Shark", location: "Sea", sellPrice: 13000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 76, name: "Suckerfish", location: "Sea", sellPrice: 1500, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 77, name: "Football Fish", location: "Sea", sellPrice: 2500, northMonths: [11,12,1,2,3], southMonths: [5,6,7,8,9], startHour: 16, endHour: 9, allDay: false },
  { id: 78, name: "Oarfish", location: "Sea", sellPrice: 9000, northMonths: [12,1,2,3,4,5], southMonths: [6,7,8,9,10,11], startHour: 0, endHour: 24, allDay: true },
  { id: 79, name: "Barreleye", location: "Sea", sellPrice: 15000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 21, endHour: 4, allDay: false },
  { id: 80, name: "Coelacanth", location: "Sea (Rain)", sellPrice: 15000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
];

const BUG_DATA = [
  { id: 1, name: "Common Butterfly", location: "Flowers", sellPrice: 160, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false },
  { id: 2, name: "Yellow Butterfly", location: "Flowers", sellPrice: 160, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false },
  { id: 3, name: "Tiger Butterfly", location: "Flowers", sellPrice: 240, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false },
  { id: 4, name: "Peacock Butterfly", location: "Flowers", sellPrice: 2500, northMonths: [2,3,4,5,6,7,8,9,10], southMonths: [4,5,8,9,10,11,12,1], startHour: 4, endHour: 19, allDay: false },
  { id: 5, name: "Common Bluebottle", location: "Flowers", sellPrice: 300, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 4, endHour: 19, allDay: false },
  { id: 6, name: "Paper Kite Butterfly", location: "Flowers", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 8, endHour: 17, allDay: false },
  { id: 7, name: "Great Purple Emperor", location: "Flying", sellPrice: 3000, northMonths: [4,5,6,7,8], southMonths: [10,11,12,1,2], startHour: 12, endHour: 17, allDay: false },
  { id: 8, name: "Monarch Butterfly", location: "Flowers", sellPrice: 140, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 4, endHour: 17, allDay: false },
  { id: 9, name: "Emperor Butterfly", location: "Flying", sellPrice: 4000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 17, endHour: 8, allDay: false },
  { id: 10, name: "Agrias Butterfly", location: "Flowers", sellPrice: 3000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 17, allDay: false },
  { id: 11, name: "Rajah Brooke's Birdwing", location: "Flowers", sellPrice: 1500, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 16, allDay: false },
  { id: 12, name: "Queen Alexandra's Birdwing", location: "Flowers", sellPrice: 3000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 8, endHour: 16, allDay: false },
  { id: 13, name: "Moth", location: "Lights", sellPrice: 130, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 19, endHour: 4, allDay: false },
  { id: 14, name: "Atlas Moth", location: "Trees", sellPrice: 3000, northMonths: [4,5,6,7], southMonths: [10,11,12,1], startHour: 19, endHour: 4, allDay: false },
  { id: 15, name: "Madagascan Sunset Moth", location: "Flowers", sellPrice: 2500, northMonths: [1,2,3,12], southMonths: [6,7,8,9], startHour: 8, endHour: 16, allDay: false },
  { id: 16, name: "Long Locust", location: "Grass", sellPrice: 200, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 8, endHour: 19, allDay: false },
  { id: 17, name: "Migratory Locust", location: "Grass", sellPrice: 600, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 18, name: "Rice Grasshopper", location: "Grass", sellPrice: 400, northMonths: [8,9,10,11], southMonths: [2,3,4,5], startHour: 8, endHour: 19, allDay: false },
  { id: 19, name: "Grasshopper", location: "Grass", sellPrice: 160, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 8, endHour: 19, allDay: false },
  { id: 20, name: "Cricket", location: "Grass", sellPrice: 130, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 17, endHour: 8, allDay: false },
  { id: 21, name: "Bell Cricket", location: "Grass", sellPrice: 430, northMonths: [9,10,11], southMonths: [3,4,5], startHour: 17, endHour: 8, allDay: false },
  { id: 22, name: "Mantis", location: "Flowers", sellPrice: 430, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 8, endHour: 17, allDay: false },
  { id: 23, name: "Orchid Mantis", location: "Flowers", sellPrice: 2400, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3,4,5], startHour: 8, endHour: 17, allDay: false },
  { id: 24, name: "Honeybee", location: "Flowers", sellPrice: 200, northMonths: [3,4,5,6,7], southMonths: [9,10,11,12,1], startHour: 8, endHour: 17, allDay: false },
  { id: 25, name: "Wasp", location: "Trees", sellPrice: 2500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 26, name: "Brown Cicada", location: "Trees", sellPrice: 250, northMonths: [7,8], southMonths: [1,2], startHour: 8, endHour: 17, allDay: false },
  { id: 27, name: "Robust Cicada", location: "Trees", sellPrice: 300, northMonths: [7,8], southMonths: [1,2], startHour: 8, endHour: 17, allDay: false },
  { id: 28, name: "Giant Cicada", location: "Trees", sellPrice: 500, northMonths: [8,9], southMonths: [2,3], startHour: 8, endHour: 17, allDay: false },
  { id: 29, name: "Walker Cicada", location: "Trees", sellPrice: 400, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 8, endHour: 17, allDay: false },
  { id: 30, name: "Evening Cicada", location: "Trees", sellPrice: 550, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 4, endHour: 8, allDay: false },
  { id: 31, name: "Cicada Shell", location: "Trees", sellPrice: 10, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 32, name: "Red Dragonfly", location: "Flying", sellPrice: 180, northMonths: [9,10], southMonths: [3,4], startHour: 4, endHour: 19, allDay: false },
  { id: 33, name: "Darner Dragonfly", location: "Flying", sellPrice: 230, northMonths: [4,5,6,7,8,9,10,11], southMonths: [10,11,12,1,2,3,4,5], startHour: 4, endHour: 19, allDay: false },
  { id: 34, name: "Banded Dragonfly", location: "Flying", sellPrice: 4500, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 8, endHour: 16, allDay: false },
  { id: 35, name: "Damselfly", location: "Flying", sellPrice: 500, northMonths: [5,6,7,8,9,10,11], southMonths: [11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 36, name: "Firefly", location: "Flying", sellPrice: 300, northMonths: [6,7], southMonths: [12,1], startHour: 19, endHour: 4, allDay: false },
  { id: 37, name: "Mole Cricket", location: "Underground", sellPrice: 500, northMonths: [1,2,11,12], southMonths: [5,6,7,8], startHour: 0, endHour: 24, allDay: true },
  { id: 38, name: "Pondskater", location: "Water", sellPrice: 130, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 39, name: "Diving Beetle", location: "Water", sellPrice: 800, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 8, endHour: 19, allDay: false },
  { id: 40, name: "Giant Water Bug", location: "Water", sellPrice: 2000, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 19, endHour: 8, allDay: false },
  { id: 41, name: "Stinkbug", location: "Flowers", sellPrice: 120, northMonths: [3,4,9,10,11,12], southMonths: [9,10,3,4,5,6], startHour: 0, endHour: 24, allDay: true },
  { id: 42, name: "Man-faced Stink Bug", location: "Flowers", sellPrice: 1000, northMonths: [3,4,5,6,7,8,9,10,11,12], southMonths: [3,4,9,10,11,12], startHour: 19, endHour: 8, allDay: false },
  { id: 43, name: "Ladybug", location: "Flowers", sellPrice: 200, northMonths: [1,2,3,4,12], southMonths: [6,7,8,9,10], startHour: 8, endHour: 17, allDay: false },
  { id: 44, name: "Tiger Beetle", location: "Ground", sellPrice: 1500, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 45, name: "Jewel Beetle", location: "Trees", sellPrice: 2400, northMonths: [5,6,7,8], southMonths: [11,12,1,2], startHour: 0, endHour: 24, allDay: true },
  { id: 46, name: "Violin Beetle", location: "Logs", sellPrice: 450, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 47, name: "Citrus Long-horned Beetle", location: "Trees", sellPrice: 350, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 48, name: "Rosalia Batesi Beetle", location: "Logs", sellPrice: 3000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 49, name: "Blue Weevil Beetle", location: "Trees", sellPrice: 800, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 50, name: "Dung Beetle", location: "Ground", sellPrice: 3000, northMonths: [1,2,12], southMonths: [6,7,8], startHour: 0, endHour: 24, allDay: true },
  { id: 51, name: "Earth-boring Dung Beetle", location: "Ground", sellPrice: 300, northMonths: [7,8,9,10,11,12], southMonths: [1,2,3,4,5,6], startHour: 0, endHour: 24, allDay: true },
  { id: 52, name: "Scarab Beetle", location: "Ground", sellPrice: 10000, northMonths: [7,8,9,10], southMonths: [1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 53, name: "Drone Beetle", location: "Trees", sellPrice: 200, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 54, name: "Goliath Beetle", location: "Trees", sellPrice: 8000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 55, name: "Saw Stag", location: "Trees", sellPrice: 2000, northMonths: [1,2,7,8,9,10,11,12], southMonths: [1,2,3,4,5,7,8], startHour: 0, endHour: 24, allDay: true },
  { id: 56, name: "Miyama Stag", location: "Trees", sellPrice: 1000, northMonths: [1,2,3,4,10,11,12], southMonths: [4,5,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 57, name: "Giant Stag", location: "Trees", sellPrice: 10000, northMonths: [7,8], southMonths: [1,2], startHour: 0, endHour: 24, allDay: true },
  { id: 58, name: "Rainbow Stag", location: "Trees", sellPrice: 6000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 59, name: "Cyclommatus Stag", location: "Trees", sellPrice: 8000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 60, name: "Golden Stag", location: "Trees", sellPrice: 12000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 61, name: "Giraffe Stag", location: "Trees", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 62, name: "Horned Dynastid", location: "Trees", sellPrice: 1350, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 63, name: "Horned Atlas", location: "Trees", sellPrice: 8000, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 64, name: "Horned Elephant", location: "Trees", sellPrice: 8000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 9, allDay: false },
  { id: 65, name: "Horned Hercules", location: "Trees", sellPrice: 12000, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 16, endHour: 8, allDay: false },
  { id: 66, name: "Walking Leaf", location: "Trees", sellPrice: 600, northMonths: [7,8,9,10], southMonths: [1,2,3,4], startHour: 16, endHour: 9, allDay: false },
  { id: 67, name: "Walking Stick", location: "Trees", sellPrice: 600, northMonths: [7,8,9,10,11], southMonths: [1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 68, name: "Bagworm", location: "Trees", sellPrice: 600, northMonths: [1,2,3,11,12], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 69, name: "Ant", location: "Ground", sellPrice: 80, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 70, name: "Hermit Crab", location: "Ground", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 19, endHour: 8, allDay: false },
  { id: 71, name: "Wharf Roach", location: "Ground", sellPrice: 200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 72, name: "Fly", location: "Trash", sellPrice: 60, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 73, name: "Mosquito", location: "Flying", sellPrice: 130, northMonths: [6,7,8,9], southMonths: [12,1,2,3], startHour: 17, endHour: 4, allDay: false },
  { id: 74, name: "Flea", location: "Villagers", sellPrice: 70, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 75, name: "Snail", location: "Ground", sellPrice: 250, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 76, name: "Pill Bug", location: "Logs", sellPrice: 250, northMonths: [1,2,3,9,10,11,12], southMonths: [3,4,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 77, name: "Centipede", location: "Logs", sellPrice: 300, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 78, name: "Spider", location: "Webs", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 79, name: "Tarantula", location: "Ground", sellPrice: 8000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 19, endHour: 4, allDay: false },
  { id: 80, name: "Scorpion", location: "Ground", sellPrice: 8000, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 19, endHour: 4, allDay: false },
];

const SEA_DATA = [
  { id: 1, name: "Seaweed", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 2, name: "Sea Grapes", sellPrice: 900, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 3, name: "Sea Cucumber", sellPrice: 500, northMonths: [11,12,1,2,3], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 4, name: "Sea Pig", sellPrice: 10000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 5, name: "Sea Star", sellPrice: 500, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 6, name: "Sea Urchin", sellPrice: 1700, northMonths: [4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,10,11], startHour: 0, endHour: 24, allDay: true },
  { id: 7, name: "Slate Pencil Urchin", sellPrice: 2000, northMonths: [1,2,3,9,10,11,12], southMonths: [3,4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 8, name: "Sea Anemone", sellPrice: 500, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 9, name: "Moon Jellyfish", sellPrice: 600, northMonths: [7,8,9,10,11,12], southMonths: [1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 10, name: "Sea Slug", sellPrice: 600, northMonths: [1,2,3,4,11,12], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 11, name: "Pearl Oyster", sellPrice: 2800, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 12, name: "Mussel", sellPrice: 1500, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 0, endHour: 24, allDay: true },
  { id: 13, name: "Oyster", sellPrice: 1100, northMonths: [9,10,11,12,1,2,3,4,5], southMonths: [3,4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 14, name: "Scallop", sellPrice: 1200, northMonths: [12,1,2,3,4,5], southMonths: [6,7,8,9,10,11], startHour: 0, endHour: 24, allDay: true },
  { id: 15, name: "Turban Shell", sellPrice: 1000, northMonths: [1,2,3,10,11,12], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 16, name: "Abalone", sellPrice: 2000, northMonths: [6,7,8,9,10,11], southMonths: [12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 17, name: "Gigas Giant Clam", sellPrice: 15000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 18, name: "Chambered Nautilus", sellPrice: 1800, northMonths: [11,12,1,2,3], southMonths: [5,6,7,8,9], startHour: 16, endHour: 9, allDay: false },
  { id: 19, name: "Octopus", sellPrice: 1200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 20, name: "Umbrella Octopus", sellPrice: 6000, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 21, name: "Vampire Squid", sellPrice: 10000, northMonths: [5,6,7,8,9,10,11,12], southMonths: [11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 22, name: "Firefly Squid", sellPrice: 1400, northMonths: [3,4,5], southMonths: [9,10,11], startHour: 21, endHour: 5, allDay: false },
  { id: 23, name: "Gazami Crab", sellPrice: 2200, northMonths: [6,7,8,9,11,12], southMonths: [12,1,2,3,5], startHour: 0, endHour: 24, allDay: true },
  { id: 24, name: "Dungeness Crab", sellPrice: 1900, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 25, name: "Snow Crab", sellPrice: 6000, northMonths: [1,2,3,4], southMonths: [7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 26, name: "Red King Crab", sellPrice: 8000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true },
  { id: 27, name: "Acorn Barnacle", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 28, name: "Spider Crab", sellPrice: 12000, northMonths: [3,4,5], southMonths: [9,10,11], startHour: 0, endHour: 24, allDay: true },
  { id: 29, name: "Tiger Prawn", sellPrice: 3000, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 16, endHour: 9, allDay: false },
  { id: 30, name: "Sweet Shrimp", sellPrice: 1400, northMonths: [12,1,2], southMonths: [6,7,8], startHour: 9, endHour: 16, allDay: false },
  { id: 31, name: "Mantis Shrimp", sellPrice: 2500, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 32, name: "Spiny Lobster", sellPrice: 5000, northMonths: [10,11,12], southMonths: [4,5,6], startHour: 0, endHour: 24, allDay: true },
  { id: 33, name: "Lobster", sellPrice: 4500, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 34, name: "Giant Isopod", sellPrice: 12000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
  { id: 35, name: "Horseshoe Crab", sellPrice: 2500, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true },
  { id: 36, name: "Sea Pineapple", sellPrice: 1500, northMonths: [10,11,12,1,2,3], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 37, name: "Spotted Garden Eel", sellPrice: 1100, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 9, endHour: 16, allDay: false },
  { id: 38, name: "Flatworm", sellPrice: 700, northMonths: [6,7,8,9,10,11,12], southMonths: [12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true },
  { id: 39, name: "Venus' Flower Basket", sellPrice: 15000, northMonths: [10,11,12,1,2,3], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true },
  { id: 40, name: "Whelk", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true },
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── Helper functions ─────────────────────────────────────────────────────────

function isAvailableAtHour(critter, hour) {
  if (critter.allDay) return true;
  const { startHour, endHour } = critter;
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  // Wraps midnight (e.g. 16-9 means 4pm to 9am)
  return hour >= startHour || hour < endHour;
}

function getMonthsForHemisphere(critter, hemisphere) {
  return hemisphere === 'north' ? critter.northMonths : critter.southMonths;
}

function isAvailableThisMonth(critter, hemisphere, month) {
  return getMonthsForHemisphere(critter, hemisphere).includes(month);
}

function isAvailableNextMonth(critter, hemisphere, month) {
  const nextMonth = month === 12 ? 1 : month + 1;
  return getMonthsForHemisphere(critter, hemisphere).includes(nextMonth);
}

function getDaysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

function getDaysUntilNextMonth() {
  return getDaysLeftInMonth() + 1;
}

function formatTimeRange(critter) {
  if (critter.allDay) return 'All day';
  const fmt = (h) => {
    if (h === 0 || h === 24) return '12AM';
    if (h === 12) return '12PM';
    return h > 12 ? `${h - 12}PM` : `${h}AM`;
  };
  return `${fmt(critter.startHour)} - ${fmt(critter.endHour)}`;
}

function formatBells(n) {
  return n.toLocaleString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [hemisphere, setHemisphere] = useState('north');
  const [profileHemisphere, setProfileHemisphere] = useState(null);
  const [activeTab, setActiveTab] = useState('now');
  const [todayEvents, setTodayEvents] = useState(null);
  const [eventsError, setEventsError] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [caughtFish, setCaughtFish] = useState({});
  const [caughtBugs, setCaughtBugs] = useState({});
  const [caughtSea, setCaughtSea] = useState({});
  const [hideCaught, setHideCaught] = useState(false);
  const { data: session } = useSession();

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load hemisphere from profile
  useEffect(() => {
    if (session) {
      fetch('/api/profile').then(r => r.json()).then(p => {
        if (p.hemisphere) {
          setHemisphere(p.hemisphere);
          setProfileHemisphere(p.hemisphere);
        }
      }).catch(() => {});
    }
  }, [session]);

  // Load caught status from individual trackers
  useEffect(() => {
    const loadCaughtData = async () => {
      try {
        const fishResult = await window.storage.get('acnh-fish-tracker-caught');
        if (fishResult) setCaughtFish(JSON.parse(fishResult.value));
      } catch {}
      try {
        const bugResult = await window.storage.get('acnh-bug-tracker-caught');
        if (bugResult) setCaughtBugs(JSON.parse(bugResult.value));
      } catch {}
      try {
        const seaResult = await window.storage.get('acnh-sea-creature-tracker');
        if (seaResult) {
          const data = JSON.parse(seaResult.value);
          if (data.caughtStatus) setCaughtSea(data.caughtStatus);
        }
      } catch {}
    };
    loadCaughtData();
  }, []);

  // Fetch today's events from Nookipedia
  useEffect(() => {
    fetch('/api/nookipedia/nh/events?date=today')
      .then(r => {
        if (!r.ok) throw new Error('API error');
        return r.json();
      })
      .then(data => {
        setTodayEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setEventsError(true);
        setTodayEvents([]);
      });
  }, []);

  const now = currentTime;
  const currentMonth = now.getMonth() + 1;
  const currentHour = now.getHours();
  const daysLeft = getDaysLeftInMonth();
  const daysUntilNext = getDaysUntilNextMonth();

  // Today's birthday villagers
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const birthdayVillagers = useMemo(() => VILLAGERS.filter(v => v.birthday === todayStr), [todayStr]);

  // Filter critters for current month
  const fishThisMonth = useMemo(() => FISH_DATA.filter(c => isAvailableThisMonth(c, hemisphere, currentMonth)), [hemisphere, currentMonth]);
  const bugsThisMonth = useMemo(() => BUG_DATA.filter(c => isAvailableThisMonth(c, hemisphere, currentMonth)), [hemisphere, currentMonth]);
  const seaThisMonth = useMemo(() => SEA_DATA.filter(c => isAvailableThisMonth(c, hemisphere, currentMonth)), [hemisphere, currentMonth]);

  // Count catchable right now
  const fishNowCount = useMemo(() => fishThisMonth.filter(c => isAvailableAtHour(c, currentHour)).length, [fishThisMonth, currentHour]);
  const bugsNowCount = useMemo(() => bugsThisMonth.filter(c => isAvailableAtHour(c, currentHour)).length, [bugsThisMonth, currentHour]);
  const seaNowCount = useMemo(() => seaThisMonth.filter(c => isAvailableAtHour(c, currentHour)).length, [seaThisMonth, currentHour]);

  // Helper to check if a critter is caught
  const isCritterCaught = (critter, type) => {
    if (type === 'fish') return !!caughtFish[critter.id];
    if (type === 'bug') return !!caughtBugs[critter.id];
    if (type === 'sea') return !!caughtSea[critter.id];
    return false;
  };

  // Leaving soon: available this month but NOT next month (uncaught first, then by price)
  const fishLeaving = useMemo(() => fishThisMonth.filter(c => !isAvailableNextMonth(c, hemisphere, currentMonth)).sort((a, b) => {
    const aCaught = !!caughtFish[a.id] ? 1 : 0;
    const bCaught = !!caughtFish[b.id] ? 1 : 0;
    if (aCaught !== bCaught) return aCaught - bCaught;
    return b.sellPrice - a.sellPrice;
  }), [fishThisMonth, hemisphere, currentMonth, caughtFish]);
  const bugsLeaving = useMemo(() => bugsThisMonth.filter(c => !isAvailableNextMonth(c, hemisphere, currentMonth)).sort((a, b) => {
    const aCaught = !!caughtBugs[a.id] ? 1 : 0;
    const bCaught = !!caughtBugs[b.id] ? 1 : 0;
    if (aCaught !== bCaught) return aCaught - bCaught;
    return b.sellPrice - a.sellPrice;
  }), [bugsThisMonth, hemisphere, currentMonth, caughtBugs]);
  const seaLeaving = useMemo(() => seaThisMonth.filter(c => !isAvailableNextMonth(c, hemisphere, currentMonth)).sort((a, b) => {
    const aCaught = !!caughtSea[a.id] ? 1 : 0;
    const bCaught = !!caughtSea[b.id] ? 1 : 0;
    if (aCaught !== bCaught) return aCaught - bCaught;
    return b.sellPrice - a.sellPrice;
  }), [seaThisMonth, hemisphere, currentMonth, caughtSea]);

  // Coming next month: available next month but NOT this month
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const fishComing = useMemo(() => FISH_DATA.filter(c => isAvailableThisMonth(c, hemisphere, nextMonth) && !isAvailableThisMonth(c, hemisphere, currentMonth)).sort((a, b) => b.sellPrice - a.sellPrice), [hemisphere, currentMonth, nextMonth]);
  const bugsComing = useMemo(() => BUG_DATA.filter(c => isAvailableThisMonth(c, hemisphere, nextMonth) && !isAvailableThisMonth(c, hemisphere, currentMonth)).sort((a, b) => b.sellPrice - a.sellPrice), [hemisphere, currentMonth, nextMonth]);
  const seaComing = useMemo(() => SEA_DATA.filter(c => isAvailableThisMonth(c, hemisphere, nextMonth) && !isAvailableThisMonth(c, hemisphere, currentMonth)).sort((a, b) => b.sellPrice - a.sellPrice), [hemisphere, currentMonth, nextMonth]);

  // Sort this month by: catchable now first, then by price desc
  const sortedFish = useMemo(() => [...fishThisMonth].sort((a, b) => {
    const aNow = isAvailableAtHour(a, currentHour) ? 1 : 0;
    const bNow = isAvailableAtHour(b, currentHour) ? 1 : 0;
    if (bNow !== aNow) return bNow - aNow;
    return b.sellPrice - a.sellPrice;
  }), [fishThisMonth, currentHour]);

  const sortedBugs = useMemo(() => [...bugsThisMonth].sort((a, b) => {
    const aNow = isAvailableAtHour(a, currentHour) ? 1 : 0;
    const bNow = isAvailableAtHour(b, currentHour) ? 1 : 0;
    if (bNow !== aNow) return bNow - aNow;
    return b.sellPrice - a.sellPrice;
  }), [bugsThisMonth, currentHour]);

  const sortedSea = useMemo(() => [...seaThisMonth].sort((a, b) => {
    const aNow = isAvailableAtHour(a, currentHour) ? 1 : 0;
    const bNow = isAvailableAtHour(b, currentHour) ? 1 : 0;
    if (bNow !== aNow) return bNow - aNow;
    return b.sellPrice - a.sellPrice;
  }), [seaThisMonth, currentHour]);

  const tabs = [
    { id: 'now', label: 'Available Now', emoji: '🕐' },
    { id: 'leaving', label: 'Leaving Soon', emoji: '⚠️' },
    { id: 'coming', label: 'Coming Next', emoji: '🌱' },
  ];

  const totalLeaving = fishLeaving.length + bugsLeaving.length + seaLeaving.length;
  const totalComing = fishComing.length + bugsComing.length + seaComing.length;

  // Caught/uncaught counts for leaving critters
  const uncaughtFishLeaving = useMemo(() => fishLeaving.filter(c => !caughtFish[c.id]), [fishLeaving, caughtFish]);
  const uncaughtBugsLeaving = useMemo(() => bugsLeaving.filter(c => !caughtBugs[c.id]), [bugsLeaving, caughtBugs]);
  const uncaughtSeaLeaving = useMemo(() => seaLeaving.filter(c => !caughtSea[c.id]), [seaLeaving, caughtSea]);
  const totalUncaughtLeaving = uncaughtFishLeaving.length + uncaughtBugsLeaving.length + uncaughtSeaLeaving.length;

  // Filtered leaving lists (when hideCaught is on)
  const displayFishLeaving = hideCaught ? uncaughtFishLeaving : fishLeaving;
  const displayBugsLeaving = hideCaught ? uncaughtBugsLeaving : bugsLeaving;
  const displaySeaLeaving = hideCaught ? uncaughtSeaLeaving : seaLeaving;

  const renderCritterCard = (critter, type, badge) => {
    const isNow = isAvailableAtHour(critter, currentHour);
    const cardKey = `${type}-${critter.id}`;
    const isHovered = hoveredCard === cardKey;
    const category = type === 'fish' ? 'fish' : type === 'bug' ? 'bugs' : 'sea-creatures';
    const caught = isCritterCaught(critter, type);

    return (
      <div
        key={cardKey}
        onMouseEnter={() => setHoveredCard(cardKey)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          ...styles.critterCard,
          borderColor: isHovered ? 'rgba(94,200,80,0.3)' : (badge === 'leaving' && !caught ? 'rgba(255,100,100,0.2)' : 'rgba(94,200,80,0.1)'),
          background: isHovered ? 'rgba(94,200,80,0.08)' : (caught && badge === 'leaving' ? 'rgba(94,200,80,0.03)' : 'rgba(12,28,14,0.95)'),
          opacity: badge ? (caught && badge === 'leaving' ? 0.55 : 1) : (isNow ? 1 : 0.6),
        }}
      >
        <div style={styles.critterLeft}>
          {isNow && !badge && (
            <div style={styles.greenDot} title="Available right now" />
          )}
          {badge === 'leaving' && (
            <span style={caught ? styles.caughtBadge : styles.leavingBadge}>{caught ? '✓ Caught' : 'Leaving!'}</span>
          )}
          {badge === 'coming' && (
            <span style={styles.comingBadge}>NEW</span>
          )}
          <AssetImg category={category} name={critter.name} size={32} />
          <div style={styles.critterInfo}>
            <span style={{ ...styles.critterName, ...(caught && badge === 'leaving' ? { textDecoration: 'line-through', color: '#5a7a50' } : {}) }}>{critter.name}</span>
            <span style={styles.critterLocation}>{critter.location || 'Diving'}</span>
          </div>
        </div>
        <div style={styles.critterRight}>
          <span style={styles.critterTime}>{formatTimeRange(critter)}</span>
          <span style={styles.critterPrice}>{formatBells(critter.sellPrice)}</span>
        </div>
      </div>
    );
  };

  const renderSection = (title, emoji, critters, type, badge) => {
    if (critters.length === 0) return null;
    return (
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <h3 style={styles.sectionTitle}>{title}</h3>
          <span style={styles.sectionCount}>{critters.length}</span>
        </div>
        <div style={styles.critterGrid}>
          {critters.map(c => renderCritterCard(c, type, badge))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Available Right Now</h1>
            <p style={styles.subtitle}>
              {MONTH_NAMES[currentMonth - 1]} {now.getDate()}, {now.getFullYear()} — {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {!profileHemisphere && (
            <div style={styles.hemisphereToggle}>
              <button
                onClick={() => setHemisphere('north')}
                style={hemisphere === 'north' ? styles.activeHem : styles.inactiveHem}
              >
                Northern
              </button>
              <button
                onClick={() => setHemisphere('south')}
                style={hemisphere === 'south' ? styles.activeHem : styles.inactiveHem}
              >
                Southern
              </button>
            </div>
          )}
          {profileHemisphere && (
            <span style={styles.hemLabel}>
              {hemisphere === 'north' ? 'Northern' : 'Southern'} Hemisphere
            </span>
          )}
        </div>

        {/* Summary bar */}
        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <span style={{ fontSize: 20 }}>🐟</span>
            <div style={styles.summaryText}>
              <span style={styles.summaryNumber}>{fishNowCount}</span>
              <span style={styles.summaryLabel}>fish now</span>
            </div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={{ fontSize: 20 }}>🦋</span>
            <div style={styles.summaryText}>
              <span style={styles.summaryNumber}>{bugsNowCount}</span>
              <span style={styles.summaryLabel}>bugs now</span>
            </div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={{ fontSize: 20 }}>🐙</span>
            <div style={styles.summaryText}>
              <span style={styles.summaryNumber}>{seaNowCount}</span>
              <span style={styles.summaryLabel}>sea now</span>
            </div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={{ fontSize: 20 }}>🎂</span>
            <div style={styles.summaryText}>
              <span style={styles.summaryNumber}>{birthdayVillagers.length}</span>
              <span style={styles.summaryLabel}>{birthdayVillagers.length === 1 ? 'birthday' : 'birthdays'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's section */}
      {(birthdayVillagers.length > 0 || (todayEvents && todayEvents.length > 0)) && (
        <div style={styles.todaySection}>
          <h3 style={styles.todaySectionTitle}>Today</h3>
          <div style={styles.todayCards}>
            {birthdayVillagers.map(v => (
              <div key={v.name} style={styles.todayCard}>
                <AssetImg category="villagers" name={v.name} size={40} />
                <div style={styles.todayCardInfo}>
                  <span style={styles.todayCardName}>{v.name}</span>
                  <span style={styles.todayCardDetail}>Birthday today!</span>
                </div>
              </div>
            ))}
            {todayEvents && todayEvents.map((evt, i) => (
              <div key={i} style={styles.todayCard}>
                <span style={{ fontSize: 28 }}>📅</span>
                <div style={styles.todayCardInfo}>
                  <span style={styles.todayCardName}>{evt.event || evt.name || 'Event'}</span>
                  {evt.type && <span style={styles.todayCardDetail}>{evt.type}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {eventsError && (
        <div style={styles.eventsErrorBanner}>
          Unable to load today's events from Nookipedia API
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isTabHovered = hoveredTab === tab.id;
          let count = null;
          if (tab.id === 'now') count = fishThisMonth.length + bugsThisMonth.length + seaThisMonth.length;
          if (tab.id === 'leaving') count = totalLeaving;
          if (tab.id === 'coming') count = totalComing;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                ...styles.tab,
                background: isActive ? 'rgba(94,200,80,0.15)' : isTabHovered ? 'rgba(94,200,80,0.06)' : 'transparent',
                borderBottom: isActive ? '2px solid #5ec850' : '2px solid transparent',
                color: isActive ? '#5ec850' : '#5a7a50',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {count !== null && (
                <span style={{
                  ...styles.tabCount,
                  background: tab.id === 'leaving' && count > 0 ? 'rgba(255,100,100,0.2)' : tab.id === 'coming' && count > 0 ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.1)',
                  color: tab.id === 'leaving' && count > 0 ? '#ff6464' : tab.id === 'coming' && count > 0 ? '#5ec850' : '#5a7a50',
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={styles.tabContent}>
        {activeTab === 'now' && (
          <div>
            <p style={styles.tabDescription}>
              Critters available this month in {MONTH_NAMES[currentMonth - 1]}. Green dots indicate catchable right now at {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
            </p>
            {renderSection(`Fish (${fishThisMonth.length})`, '🐟', sortedFish, 'fish', null)}
            {renderSection(`Bugs (${bugsThisMonth.length})`, '🦋', sortedBugs, 'bug', null)}
            {renderSection(`Sea Creatures (${seaThisMonth.length})`, '🐙', sortedSea, 'sea', null)}
          </div>
        )}

        {activeTab === 'leaving' && (
          <div>
            <p style={styles.tabDescription}>
              These critters are available now but will NOT be available next month. You have <strong style={{ color: '#ff6464' }}>{daysLeft} days</strong> left to catch them!
              {totalLeaving > 0 && totalUncaughtLeaving < totalLeaving && (
                <span> — <strong style={{ color: '#d4b030' }}>{totalUncaughtLeaving}</strong> still needed, <strong style={{ color: '#5ec850' }}>{totalLeaving - totalUncaughtLeaving}</strong> already caught.</span>
              )}
            </p>
            {totalLeaving > 0 && (
              <div style={styles.filterRow}>
                <button
                  onClick={() => setHideCaught(!hideCaught)}
                  style={{
                    ...styles.filterButton,
                    background: hideCaught ? 'rgba(94,200,80,0.2)' : 'transparent',
                    color: hideCaught ? '#5ec850' : '#5a7a50',
                    border: hideCaught ? '1px solid rgba(94,200,80,0.3)' : '1px solid rgba(94,200,80,0.15)',
                  }}
                >
                  {hideCaught ? '✓ ' : ''}Hide caught
                </button>
              </div>
            )}
            {totalLeaving === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: 48 }}>🎉</span>
                <p style={{ color: '#5a7a50', marginTop: 12 }}>No critters are leaving after this month!</p>
              </div>
            ) : hideCaught && totalUncaughtLeaving === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: 48 }}>🎉</span>
                <p style={{ color: '#5ec850', marginTop: 12, fontWeight: 700 }}>You have caught all leaving critters!</p>
                <p style={{ color: '#5a7a50', marginTop: 4, fontSize: 13 }}>All {totalLeaving} critters leaving this month are in your collection.</p>
              </div>
            ) : (
              <>
                {renderSection('Fish Leaving', '🐟', displayFishLeaving, 'fish', 'leaving')}
                {renderSection('Bugs Leaving', '🦋', displayBugsLeaving, 'bug', 'leaving')}
                {renderSection('Sea Creatures Leaving', '🐙', displaySeaLeaving, 'sea', 'leaving')}
              </>
            )}
          </div>
        )}

        {activeTab === 'coming' && (
          <div>
            <p style={styles.tabDescription}>
              New critters arriving in <strong style={{ color: '#5ec850' }}>{MONTH_NAMES[nextMonth - 1]}</strong> — that is in <strong style={{ color: '#5ec850' }}>{daysUntilNext} days</strong>.
            </p>
            {totalComing === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: 48 }}>📋</span>
                <p style={{ color: '#5a7a50', marginTop: 12 }}>No new critters arriving next month.</p>
              </div>
            ) : (
              <>
                {renderSection('New Fish', '🐟', fishComing, 'fish', 'coming')}
                {renderSection('New Bugs', '🦋', bugsComing, 'bug', 'coming')}
                {renderSection('New Sea Creatures', '🐙', seaComing, 'sea', 'coming')}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    padding: 24,
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    minHeight: '100vh',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 900,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    marginTop: 4,
  },
  hemisphereToggle: {
    display: 'flex',
    gap: 0,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid rgba(94,200,80,0.2)',
  },
  activeHem: {
    padding: '8px 16px',
    background: 'rgba(94,200,80,0.2)',
    color: '#5ec850',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    outline: 'none',
  },
  inactiveHem: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#5a7a50',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    outline: 'none',
  },
  hemLabel: {
    fontSize: 13,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    padding: '8px 16px',
    background: 'rgba(94,200,80,0.06)',
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.1)',
  },
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '16px 24px',
    background: 'rgba(12,28,14,0.95)',
    borderRadius: 12,
    border: '1px solid rgba(94,200,80,0.1)',
    flexWrap: 'wrap',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: 900,
    fontFamily: "'Playfair Display', serif",
    color: '#d4b030',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  summaryDivider: {
    width: 1,
    height: 36,
    background: 'rgba(94,200,80,0.1)',
  },
  todaySection: {
    marginBottom: 24,
  },
  todaySectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#d4b030',
    marginBottom: 12,
  },
  todayCards: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  todayCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(212,176,48,0.08)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 10,
  },
  todayCardInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  todayCardName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#c8e6c0',
  },
  todayCardDetail: {
    fontSize: 11,
    color: '#d4b030',
    fontFamily: "'DM Mono', monospace",
  },
  eventsErrorBanner: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    marginBottom: 16,
    padding: '8px 16px',
    background: 'rgba(255,100,100,0.06)',
    border: '1px solid rgba(255,100,100,0.15)',
    borderRadius: 8,
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    borderBottom: '1px solid rgba(94,200,80,0.1)',
    marginBottom: 24,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  tabCount: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    padding: '2px 8px',
    borderRadius: 10,
  },
  tabContent: {
    minHeight: 200,
  },
  tabDescription: {
    fontSize: 13,
    color: '#5a7a50',
    marginBottom: 20,
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#c8e6c0',
    margin: 0,
  },
  sectionCount: {
    fontSize: 12,
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
    background: 'rgba(74,172,240,0.1)',
    padding: '2px 8px',
    borderRadius: 8,
  },
  critterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 8,
  },
  critterCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.1)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  critterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  critterInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  critterName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#c8e6c0',
  },
  critterLocation: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  critterRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  critterTime: {
    fontSize: 11,
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
  },
  critterPrice: {
    fontSize: 13,
    fontWeight: 700,
    color: '#d4b030',
    fontFamily: "'DM Mono', monospace",
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#5ec850',
    boxShadow: '0 0 6px rgba(94,200,80,0.5)',
    flexShrink: 0,
  },
  leavingBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#ff6464',
    background: 'rgba(255,100,100,0.15)',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: "'DM Mono', monospace",
    flexShrink: 0,
  },
  comingBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#5ec850',
    background: 'rgba(94,200,80,0.15)',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: "'DM Mono', monospace",
    flexShrink: 0,
  },
  caughtBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#5a7a50',
    background: 'rgba(94,200,80,0.08)',
    padding: '2px 6px',
    borderRadius: 4,
    fontFamily: "'DM Mono', monospace",
    flexShrink: 0,
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
};
