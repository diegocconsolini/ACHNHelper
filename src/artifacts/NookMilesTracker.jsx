'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

// Verified against Nookipedia, Game8, and multiple community sources (96 achievements total)
// Base game: 84 achievements | Swimming update (1.3.0): 3 | Version 2.0: 9
const NOOK_MILES_DATA = [
  // --- Fishing ---
  { id: 1, name: "Angling for Perfection!", category: "Fishing", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 2, name: "Island Ichthyologist", category: "Fishing", tiers: [{ target: 10, reward: 300 },{ target: 20, reward: 500 },{ target: 40, reward: 1000 },{ target: 60, reward: 2000 },{ target: 80, reward: 3000 }], isRepeatable: false },
  { id: 3, name: "Cast Master", category: "Fishing", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 }], isRepeatable: false },
  { id: 4, name: "Trash Fishin'", category: "Fishing", tiers: [{ target: 3, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 5, name: "Fishing Tourney!", category: "Fishing", tiers: [{ target: 1, reward: 300 },{ target: 2, reward: 500 },{ target: 3, reward: 1000 },{ target: 4, reward: 2000 }], isRepeatable: false },
  // --- Bug Catching ---
  { id: 6, name: "You've Got the Bug", category: "Bug Catching", tiers: [{ target: 10, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 7, name: "Bugs Don't Bug Me", category: "Bug Catching", tiers: [{ target: 10, reward: 300 },{ target: 20, reward: 500 },{ target: 40, reward: 1000 },{ target: 60, reward: 2000 },{ target: 80, reward: 3000 }], isRepeatable: false },
  { id: 8, name: "Flea Flicker", category: "Bug Catching", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 }], isRepeatable: false },
  { id: 9, name: "Cicada Memories", category: "Bug Catching", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 10, name: "Netting Better!", category: "Bug Catching", tiers: [{ target: 5, reward: 1000 }], isRepeatable: false },
  { id: 11, name: "Taking the Sting Out", category: "Bug Catching", tiers: [{ target: 2, reward: 300 }], isRepeatable: false },
  { id: 12, name: "Bug-Off!", category: "Bug Catching", tiers: [{ target: 1, reward: 300 },{ target: 2, reward: 500 },{ target: 3, reward: 1000 },{ target: 4, reward: 2000 }], isRepeatable: false },
  // --- Diving (added in 1.3.0 swimming update) ---
  { id: 13, name: "Deep Dive", category: "Diving", tiers: [{ target: 5, reward: 300 },{ target: 50, reward: 500 },{ target: 250, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 2500, reward: 3000 }], isRepeatable: true },
  { id: 14, name: "Underwater Understudy", category: "Diving", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 40, reward: 3000 }], isRepeatable: false },
  { id: 15, name: "You Otter Know", category: "Diving", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  // --- DIY ---
  { id: 16, name: "Have a Nice DIY!", category: "DIY", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 150, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: false },
  { id: 17, name: "DIY Tools", category: "DIY", tiers: [{ target: 5, reward: 300 },{ target: 50, reward: 500 },{ target: 200, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 18, name: "DIY Furniture", category: "DIY", tiers: [{ target: 5, reward: 300 },{ target: 50, reward: 500 },{ target: 200, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 19, name: "Furniture Freshener", category: "DIY", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: false },
  { id: 20, name: "Rough-hewn", category: "DIY", tiers: [{ target: 20, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 5000, reward: 3000 }], isRepeatable: true },
  { id: 21, name: "Trashed Tools", category: "DIY", tiers: [{ target: 1, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: true },
  // --- Nature ---
  { id: 22, name: "Rock-Splitting Champ", category: "Nature", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 23, name: "Bona Fide Bone Finder!", category: "Nature", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 24, name: "Fossil Assessment", category: "Nature", tiers: [{ target: 5, reward: 300 },{ target: 30, reward: 500 },{ target: 100, reward: 1000 },{ target: 300, reward: 2000 },{ target: 500, reward: 3000 }], isRepeatable: false },
  { id: 25, name: "Go Ahead. Be Shellfish!", category: "Nature", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 200, reward: 1000 },{ target: 500, reward: 2000 },{ target: 1000, reward: 3000 }], isRepeatable: true },
  { id: 26, name: "Clam and Collected", category: "Nature", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: true },
  { id: 27, name: "Shady Shakedown", category: "Nature", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 1000 },{ target: 20, reward: 2000 },{ target: 50, reward: 3000 },{ target: 100, reward: 5000 }], isRepeatable: true },
  { id: 28, name: "Paydirt!", category: "Nature", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  // --- Gardening ---
  { id: 29, name: "Greedy Weeder", category: "Gardening", tiers: [{ target: 50, reward: 300 },{ target: 200, reward: 500 },{ target: 1000, reward: 1000 },{ target: 2000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 30, name: "Flower Power", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 200, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: false },
  { id: 31, name: "Flower Tender", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 100, reward: 1000 },{ target: 500, reward: 2000 },{ target: 1000, reward: 3000 }], isRepeatable: true },
  { id: 32, name: "Tomorrow's Trees Today", category: "Gardening", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 30, reward: 1000 }], isRepeatable: false },
  { id: 33, name: "Pick of the Bunch", category: "Gardening", tiers: [{ target: 20, reward: 300 },{ target: 100, reward: 500 },{ target: 500, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 34, name: "Fruit Roots", category: "Gardening", tiers: [{ target: 1, reward: 100 },{ target: 2, reward: 200 },{ target: 3, reward: 300 },{ target: 4, reward: 500 },{ target: 5, reward: 1000 }], isRepeatable: false },
  { id: 35, name: "Shrubbery Hubbubbery", category: "Gardening", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  // --- Home ---
  { id: 36, name: "Dream House", category: "Home", tiers: [{ target: 1, reward: 500 },{ target: 2, reward: 1000 },{ target: 5, reward: 2000 },{ target: 6, reward: 3000 },{ target: 7, reward: 5000 }], isRepeatable: false },
  { id: 37, name: "Decorated Decorator", category: "Home", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 38, name: "Hoard Reward", category: "Home", tiers: [{ target: 5, reward: 300 },{ target: 15, reward: 1000 },{ target: 30, reward: 2000 },{ target: 100, reward: 3000 },{ target: 150, reward: 5000 }], isRepeatable: false },
  { id: 39, name: "Good Things in Store!", category: "Home", tiers: [{ target: 20, reward: 300 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 },{ target: 300, reward: 5000 }], isRepeatable: false },
  { id: 40, name: "Remarkable Remodeler", category: "Home", tiers: [{ target: 1, reward: 500 },{ target: 3, reward: 1000 },{ target: 5, reward: 2000 }], isRepeatable: false },
  // --- Island Life ---
  { id: 41, name: "Island Miles!", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 42, name: "Island Togetherness", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: false },
  { id: 43, name: "Smile Isle", category: "Island Life", tiers: [{ target: 1, reward: 400 },{ target: 10, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 44, name: "Reaction Ruler", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 42, reward: 3000 }], isRepeatable: false },
  { id: 45, name: "Island Shutterbug", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 46, name: "Edit Credit", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 47, name: "NookPhone Life", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 48, name: "That's One Smart Phone", category: "Island Life", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  { id: 49, name: "Growing Collection", category: "Island Life", tiers: [{ target: 100, reward: 300 },{ target: 200, reward: 500 },{ target: 300, reward: 1000 },{ target: 400, reward: 1000 },{ target: 500, reward: 3000 }], isRepeatable: false },
  { id: 50, name: "Exterior Decorator", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 51, name: "Island Icons", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 2, reward: 500 }], isRepeatable: false },
  { id: 52, name: "Island Designer", category: "Island Life", tiers: [{ target: 1, reward: 500 },{ target: 2, reward: 1000 },{ target: 3, reward: 1000 }], isRepeatable: false },
  { id: 53, name: "Fun with Fences", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 54, name: "It's Raining Treasure!", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: true },
  { id: 55, name: "Pit-y Party!", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 56, name: "Faint of Heart", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 57, name: "Overcoming Pitfalls", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 58, name: "Faked Out!", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 59, name: "Lost Treasure", category: "Island Life", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 60, name: "Snowmaestro", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 61, name: "Wishes Come True", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 30, reward: 1000 },{ target: 200, reward: 2000 }], isRepeatable: false },
  { id: 62, name: "Wispy Island Secrets", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 63, name: "Gulliver's Travails", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 64, name: "True Patron of the Arts", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 65, name: "True Friends", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 2, reward: 500 },{ target: 3, reward: 1000 }], isRepeatable: false },
  { id: 66, name: "Active Island Resident", category: "Island Life", tiers: [{ target: 3, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 300, reward: 3000 }], isRepeatable: false },
  { id: 67, name: "Golden Milestone", category: "Island Life", tiers: [{ target: 1, reward: 300 },{ target: 2, reward: 500 },{ target: 3, reward: 1000 },{ target: 4, reward: 2000 },{ target: 5, reward: 3000 }], isRepeatable: false },
  // --- Commerce ---
  { id: 68, name: "Shop to It", category: "Commerce", tiers: [{ target: 1, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: true },
  { id: 69, name: "Nook Miles for Miles!", category: "Commerce", tiers: [{ target: 5, reward: 300 },{ target: 50, reward: 500 },{ target: 200, reward: 1000 },{ target: 1000, reward: 2000 },{ target: 3000, reward: 3000 }], isRepeatable: true },
  { id: 70, name: "First-Time Buyer", category: "Commerce", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 71, name: "Seller of Unwanted Stuff", category: "Commerce", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 72, name: "Moving Fees Paid!", category: "Commerce", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 73, name: "Bell Ringer", category: "Commerce", tiers: [{ target: 5000, reward: 300 },{ target: 50000, reward: 500 },{ target: 500000, reward: 1000 },{ target: 2000000, reward: 2000 },{ target: 5000000, reward: 3000 }], isRepeatable: true },
  { id: 74, name: "Miles for Stalkholders", category: "Commerce", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 75, name: "Cornering the Stalk Market", category: "Commerce", tiers: [{ target: 1000, reward: 300 },{ target: 10000, reward: 500 },{ target: 100000, reward: 1000 },{ target: 1000000, reward: 2000 },{ target: 10000000, reward: 3000 }], isRepeatable: true },
  { id: 76, name: "No More Loan Payments!", category: "Commerce", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  // --- Communication ---
  { id: 77, name: "Bulletin-Board Benefit", category: "Communication", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 78, name: "Popular Pen Pal", category: "Communication", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: false },
  { id: 79, name: "Island and Yourland", category: "Communication", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 }], isRepeatable: true },
  { id: 80, name: "Host the Most", category: "Communication", tiers: [{ target: 1, reward: 300 },{ target: 5, reward: 500 },{ target: 10, reward: 1000 }], isRepeatable: true },
  // --- Fashion ---
  { id: 81, name: "Making a Change", category: "Fashion", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  // --- Customization ---
  { id: 82, name: "First Custom Design!", category: "Customization", tiers: [{ target: 1, reward: 500 }], isRepeatable: false },
  { id: 83, name: "Custom Design Pro!", category: "Customization", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  // --- Event ---
  { id: 84, name: "K.K. Mania", category: "Event", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 30, reward: 1000 },{ target: 60, reward: 2000 },{ target: 100, reward: 3000 }], isRepeatable: true },
  { id: 85, name: "Birthday Celebration", category: "Event", tiers: [{ target: 1, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 86, name: "Happy Birthday!", category: "Event", tiers: [{ target: 1, reward: 2000 }], isRepeatable: false },
  { id: 87, name: "Countdown Celebration", category: "Event", tiers: [{ target: 1, reward: 1000 }], isRepeatable: false },
  // --- Version 2.0 Update ---
  { id: 88, name: "Writing a Cookbook?", category: "Cooking", tiers: [{ target: 10, reward: 500 },{ target: 30, reward: 1000 },{ target: 50, reward: 2000 }], isRepeatable: false },
  { id: 89, name: "Mmm-Mmm-Miles!", category: "Cooking", tiers: [{ target: 5, reward: 300 },{ target: 5, reward: 500 },{ target: 30, reward: 1000 },{ target: 100, reward: 2000 },{ target: 500, reward: 3000 }], isRepeatable: true },
  { id: 90, name: "Nice to Meet You, Gyroid!", category: "Island Life", tiers: [{ target: 1, reward: 300 }], isRepeatable: false },
  { id: 91, name: "Gyroid Getter", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 15, reward: 500 },{ target: 20, reward: 1000 }], isRepeatable: false },
  { id: 92, name: "Sprout Out Loud", category: "Gardening", tiers: [{ target: 5, reward: 300 },{ target: 20, reward: 500 },{ target: 50, reward: 1000 },{ target: 100, reward: 2000 },{ target: 200, reward: 3000 }], isRepeatable: false },
  { id: 93, name: "Executive Producer", category: "Gardening", tiers: [{ target: 10, reward: 300 },{ target: 50, reward: 500 },{ target: 150, reward: 1000 },{ target: 500, reward: 2000 },{ target: 1000, reward: 3000 }], isRepeatable: true },
  { id: 94, name: "Set Sail for Adventure", category: "Island Life", tiers: [{ target: 3, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true },
  { id: 95, name: "Come Home to the Roost!", category: "Island Life", tiers: [{ target: 5, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true },
  { id: 96, name: "Stretch to Refresh!", category: "Island Life", tiers: [{ target: 3, reward: 300 },{ target: 10, reward: 500 },{ target: 20, reward: 1000 },{ target: 30, reward: 2000 },{ target: 50, reward: 3000 }], isRepeatable: true }
];

const CATEGORY_EMOJI = {
  "Fishing": "🎣",
  "Bug Catching": "🦋",
  "Diving": "🤿",
  "Gardening": "🌸",
  "Nature": "🌿",
  "DIY": "🔨",
  "Home": "🏠",
  "Fashion": "👔",
  "Commerce": "💰",
  "Island Life": "🏝️",
  "Communication": "💬",
  "Event": "🎉",
  "Cooking": "🍳",
  "Customization": "🎨"
};

const CATEGORY_ASSET = {
  "Fishing": { category: "tools", name: "fishing rod" },
  "Bug Catching": { category: "tools", name: "net" },
  "DIY": { category: "tools", name: "stone axe" },
};

function CategoryIcon({ cat, size = 20 }) {
  const asset = CATEGORY_ASSET[cat];
  if (asset) {
    return <AssetImg category={asset.category} name={asset.name} size={size} />;
  }
  return <span>{CATEGORY_EMOJI[cat]}</span>;
}

const CATEGORIES = [
  "All", "Fishing", "Bug Catching", "Diving", "Gardening", "Nature", "DIY",
  "Home", "Fashion", "Commerce", "Island Life", "Communication",
  "Event", "Cooking", "Customization"
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

  const calculateStats = (filtered) => {
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

  const filteredAchievements = getFilteredAchievements();
  const stats = calculateStats(filteredAchievements);

  if (isLoading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
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
            <span style={{ ...styles.catStatLabel, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CategoryIcon cat={cat} size={16} /> {cat}</span>
            <span style={styles.catStatValue}>{data.completed}/{data.total} • {data.miles.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={styles.achievementsGrid}>
        {filteredAchievements.map(ach => {
          const currentTier = achievements[ach.id] || 0;
          const milesEarned = Array.from({ length: currentTier }, (_, i) => ach.tiers[i]?.reward || 0).reduce((a, b) => a + b, 0);

          return (
            <div key={ach.id} style={styles.achievementCard}>
              <div style={styles.achHeader}>
                <h3 style={styles.achName}>{ach.name}</h3>
                <div style={styles.achBadges}>
                  <span style={{ ...styles.categoryBadge, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CategoryIcon cat={ach.category} size={14} /> {ach.category}
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
    width: '100%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
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
    color: '#5a7a50',
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
    color: '#c8e6c0',
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
    color: '#c8e6c0',
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
    color: '#c8e6c0'
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
    color: '#c8e6c0'
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
    color: '#c8e6c0',
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
