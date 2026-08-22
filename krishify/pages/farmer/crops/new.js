const React = require("react")

function FarmerCropListingNewPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "Create Crop Listing"),
      React.createElement(
        "p",
        null,
        "Fill in the details for your new crop listing below."
      ),
      React.createElement("hr", { className: "my-8" }),
      React.createElement(
        "div",
        { className: "mb-6" },
        React.createElement(
          "h3",
          { className: "text-xl font-medium text-secondary mb-2" },
          "AI Quality Assessment"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-secondary mb-3" },
          "Submit your crop image for AI-assisted quality analysis."
        ),
        React.createElement(
          "form",
          { id: "assessCropForm", className: "space-y-4" },
          React.createElement(
            "div",
            { className: "hidden" },
            React.createElement("input", {
              type: "text",
              id: "cropId",
              name: "cropId",
              value: "",
              defaultValue: "",
            })
          ),
          React.createElement(
            "div",
            {
              className:
                "border rounded p-4 bg-secondary/5 mb-4 flex items-center justify-between",
            },
            React.createElement(
              "span",
              { className: "text-sm text-secondary" },
              "Select Crop Image:"
            ),
            React.createElement(
              "span",
              { className: "text-primary" },
              "No image selected"
            )
          ),
          React.createElement(
            "div",
            {
              className:
                "border rounded p-4 bg-secondary/5 mb-4 max-w-md",
              id: "imagePreviewContainer",
            },
            React.createElement("p", { className: "text-xs text-secondary text-center py-8" }),
            React.createElement("input", {
              type: "file",
              id: "cropImage",
              name: "cropImage",
              accept: "image/jpeg,image/png,image/webp",
              className: "hidden",
            })
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: openImagePicker,
              className:
                "w-full bg-primary text-white py-2 rounded mt-3 hover:bg-primary/90",
              disabled: false,
            },
            "Assess Crop Quality"
          )
        ),
        React.createElement(
          "div",
          { id: "assessmentResult", className: "mt-4 p-4 hidden" },
          React.createElement(
            "div",
            { className: "bg-secondary/10 rounded p-3 mb-2" },
            React.createElement("h4", { className: "font-medium" }, "Assessment Result"),
            React.createElement("p", { className: "text-sm" }, "Loading...")
          )
        )
      )
    ),
  )
}

function FarmerCropListingIndexPage() {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-white" },
    React.createElement(
      "div",
      { className: "max-w-2xl mx-auto py-12 px-4 text-center" },
      React.createElement("h2", { className: "text-3xl font-bold text-primary" }, "My Crop Listings"),
      React.createElement(
        "p",
        null,
        "Your active crop listings on Krishify"
      ),
      React.createElement(
        "p",
        null,
        "Use the API endpoints to manage your listings."
      )
    ),
  )
}

// Client-side only: Image assessment form handler
if (typeof window !== "undefined") {
  let selectedImage = null
  let selectedImageUrl = null

  function openImagePicker() {
    const imageInput = document.getElementById("cropImage")
    if (imageInput) {
      imageInput.click()
    }
  }

  function handleImageSelect(event) {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = function (e) {
      selectedImage = e.target.result
      selectedImageUrl = e.target.result

      const previewContainer = document.getElementById("imagePreviewContainer")
      const previewText = previewContainer.querySelector("p")

      if (previewText) {
        previewContainer.removeChild(previewText)
      }

      const img = React.createElement("img", {
        src: e.target.result,
        className: "max-w-full rounded mb-2",
        alt: "Selected crop image",
      })

      const fileName = React.createElement(
        "p",
        { className: "text-xs text-primary" },
        file.name
      )

      previewContainer.appendChild(img)
      previewContainer.appendChild(fileName)
    }

    reader.readAsDataURL(file)
  }

  function submitAssessment() {
    const cropIdInput = document.getElementById("cropId")
    const cropId = cropIdInput ? cropIdInput.value : ""

    if (!cropId) {
      alert("Please select a crop listing first")
      return
    }

    // Show loading state
    const resultDiv = document.getElementById("assessmentResult")
    if (resultDiv) {
      resultDiv.classList.remove("hidden")
      resultDiv.innerHTML = `
        <div class="bg-secondary/10 rounded p-3 mb-2">
          <h4 class="font-medium">Assessment Result</h4>
          <p class="text-sm">Processing AI assessment...</p>
        </div>
      `
    }

    try {
      const formData = new FormData()
      formData.append("imageBase64", selectedImage.split("base64,")[1] || selectedImage)
      formData.append("imageMimeType", "image/jpeg")
      formData.append("cropId", cropId)

      fetch("/api/crop-quality", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.assessment) {
            const assessment = data.assessment
            let issuesList = ""
            if (assessment.issues && assessment.issues.length > 0) {
              issuesList = `
                <ul class="list-disc pl-3 text-sm text-secondary">
                  ${assessment.issues.map(issue => `<li>${issue}</li>`).join("")}
                </ul>`
            }

            const gradeClass = assessment.grade.toLowerCase()
            resultDiv.innerHTML = `
              <div class="bg-secondary/10 rounded p-3 mb-2">
                <h4 class="font-medium">Assessment Result</h4>
                <p class="text-sm">${assessment.observations || "No observations"}</p>
              </div>
              <div class="text-center mb-3">
                <div class="text-3xl font-bold ${gradeClass} mb-1">
                  ${assessment.score}/100
                </div>
                <div class="text-sm text-secondary">${assessment.grade}</div>
              </div>
              ${issuesList || ""}
              <div class="text-xs text-secondary mt-2">
                Confidence: ${assessment.confidence || 0}%
                • Provider: ${assessment.provider}
                • Model: ${assessment.model}
              </div>
            `
          } else {
            throw new Error(data.error || "Assessment failed")
          }
        })
        .catch((error) => {
          console.error("Assessment error:", error)
          const resultDiv = document.getElementById("assessmentResult")
          if (resultDiv) {
            resultDiv.classList.remove("hidden")
            resultDiv.innerHTML = `
              <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-2">
                <strong>Assessment failed:</strong> ${error.message}
              </div>
            `
          }
        })
    } catch (err) {
      console.error("Assessment error:", err)
      const resultDiv = document.getElementById("assessmentResult")
      if (resultDiv) {
        resultDiv.classList.remove("hidden")
        resultDiv.innerHTML = `
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-2">
            <strong>Assessment failed:</strong> ${err.message}
          </div>
        `
      }
    }
  }

  // Initialize when page loads
  document.addEventListener("DOMContentLoaded", function () {
    const assessForm = document.getElementById("assessCropForm")
    const assessmentResult = document.getElementById("assessmentResult")

    if (assessForm) {
      assessForm.addEventListener("submit", function (e) {
        e.preventDefault()
        if (selectedImage) {
          submitAssessment()
        }
      })
    }
  })
}