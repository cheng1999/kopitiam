var config = {};
config.categories = [
  { name: "drink"},
  { name: "tin"},
  { name: "toast"},
];
config.printers = [
  { name: "p1", ip:"127.0.0.1",port:8081},
  { name: "p2", ip:"192.168.192.168"}
];
config.items = [
  { name: "Kopi O", category: "drink", price: 1.2, printer: 'p1'},
  { name: "Kopi C", category: "drink", price: 1.8, printer: 'p1'},
  { name: "Kopi C peng", category: "drink", price: 2, printer: 'p1' },
  { name: "Cola", category: "tin", price: 2.2, printer: 'p1' },
  { name: "Garlic 嘿Toast", category: "toast", price: 2.5, printer:'p2' },
];
config.remarks = [
  { text: "- ais"},
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
];


module.exports = config;
