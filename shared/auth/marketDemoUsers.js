export const MARKET_DEMO_USERS = [
  { id: "market-ceo-pratap", name: "Pratap", email: "pratap@regenplastic.com", role: "CEO", region: "All Regions", team: "Leadership" },
  { id: "market-head-yadagiri", name: "Yadagiri", email: "yadagiri@regenplastic.com", role: "Procurement Head", region: "All Regions", team: "Procurement" },
  { id: "market-exec-janardhan", name: "Janardhan", email: "janardhan@regenplastic.com", role: "Procurement Executive", region: "West", team: "Procurement Field Team" },
  { id: "market-exec-bhanu", name: "Bhanu", email: "bhanu@regenplastic.com", role: "Procurement Executive", region: "South", team: "Procurement Field Team" },
  { id: "market-exec-antony", name: "Antony", email: "antony@regenplastic.com", role: "Procurement Executive", region: "North", team: "Procurement Field Team" },
  { id: "market-exec-umesh", name: "Umesh", email: "umesh@regenplastic.com", role: "Procurement Executive", region: "East", team: "Procurement Field Team" },
  { id: "market-mrf-namitha", name: "Namitha", email: "namitha@regenplastic.com", role: "MRF Focal", region: "South", team: "MRF Excellence" },
  { id: "market-finance-deepa", name: "Deepa", email: "deepa@regenplastic.com", role: "Finance", region: "All Regions", team: "Finance" },
  { id: "market-hr-bhavani", name: "Bhavani", email: "bhavani@regenplastic.com", role: "HR/Admin", region: "All Regions", team: "People Ops" },
  { id: "market-vendor-demo", name: "Demo Vendor", email: "vendor.demo@example.com", role: "Vendor", region: "West", team: "External Vendor" },
];

export function getDefaultMarketUser() {
  return MARKET_DEMO_USERS[0];
}