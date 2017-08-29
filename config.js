var config = {};
config.categories = [
  { name: "drink"},
  { name: "tin"},
  { name: "toast"},
]
config.items = [
  { name: "Kopi O", category: "drink", price: 1.2 },
  { name: "Kopi C", category: "drink", price: 1.8 },
  { name: "Kopi C peng", category: "drink", price: 2 },
  { name: "Cola", category: "tin", price: 2.2 },
  { name: "Garlic Toast", category: "toast", price: 2.5 },
];

config.remarks = [
  { text: "kurang ais"},
  { text: "kao"},
];

config.extra = [
  { text: "lemon", price: 0.4 },
  { text: "ci", price: 0.5 },
];

config.tablenumber = [
  '1',
  '2',
  '3', 
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'C1',
  'C2',
]


module.exports = config;
