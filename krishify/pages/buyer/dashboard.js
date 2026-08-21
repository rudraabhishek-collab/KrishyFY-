const React = require("react")

function BuyerDashboardPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h1", { className: "text-3xl font-bold text-primary" }, "Krishify - Buyer Dashboard"),
      React.createElement("p", null, "Welcome to the buyer dashboard."),
      React.createElement("p", null, "Role: Buyer"),
      React.createElement("p", null, "This dashboard is for buyers only.")
    ),
  )
}

module.exports = BuyerDashboardPage