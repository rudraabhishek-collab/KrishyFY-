const React = require("react")

function FarmerDashboardPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h1", { className: "text-3xl font-bold text-primary" }, "Krishify - Farmer Dashboard"),
      React.createElement("p", null, "Welcome to your farmer dashboard."),
      React.createElement("p", null, "Role: Farmer"),
      React.createElement("p", null, "This dashboard is for farmers only.")
    ),
  )
}

module.exports = FarmerDashboardPage