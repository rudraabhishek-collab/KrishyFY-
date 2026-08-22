const React = require("react")

function CropDetailPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Crop Detail"),
      React.createElement(
        "p",
        null,
        "View details of a specific crop listing."
      ),
      React.createElement(
        "p",
        null,
        "GET /api/crops/[id]"
      ),
      React.createElement(
        "div",
        { className: "bg-secondary/10 rounded p-4 mb-6 mt-6 mt-auto" },
        React.createElement(
          "h3",
          { className: "text-xl font-medium text-secondary mb-4" },
          "AI Crop Quality Assessment"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-secondary mb-3" },
          "Visual quality analysis of the crop."
        ),
        React.createElement(
          "div",
          { id: "assessmentDisplay", className: "hidden p-4" },
          React.createElement(
            "p",
            { className: "text-sm text-secondary" },
            "Start assessment to see quality analysis"
          )
        )
      )
    ),
  )
}

// Client-side only: Initialize assessment display after hydration
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const assessmentDisplay = document.getElementById("assessmentDisplay")

    // Mock assessment for demonstration - would be fetched from API in production
    const mockAssessment = {
      score: 86,
      grade: "A",
      issues: ["Minor leaf discoloration"],
      observations: "Crop appears visually healthy with minor visible imperfections.",
      confidence: 92,
      provider: "TEST",
      model: "demo-model",
      status: "COMPLETED",
    }

    if (mockAssessment && mockAssessment.score !== undefined) {
      assessmentDisplay.classList.remove("hidden")

      const gradeClass = mockAssessment.grade.toLowerCase()
      const issuesList = mockAssessment.issues && mockAssessment.issues.length > 0
        ? `<ul class="list-disc pl-3 text-sm text-secondary mb-2">
           ${mockAssessment.issues.map(issue => `<li>${issue}</li>`).join("")}
         </ul>`
        : ""

      assessmentDisplay.innerHTML = `
        <div class="text-3xl font-bold ${gradeClass} mb-2">${mockAssessment.score}/100</div>
        <div class="text-secondary mb-2">${mockAssessment.grade}</div>
        ${issuesList || ""}
        <p class="text-xs text-secondary mt-2">
          ${mockAssessment.observations || "No observations available."}
        </p>
        <p class="text-xs text-secondary">
          AI-assisted visual assessment • Provider: ${mockAssessment.provider}
          • Model: ${mockAssessment.model}
        </p>
      `
    }
  })
}