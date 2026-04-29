 import Auth from "https://esm.sh/@reflowhq/auth";

  document.addEventListener("DOMContentLoaded", async () => {
    const storeId = 1909008562;
    const paymentProvider = "stripe";
    const plansContainer = document.getElementById("plans-container");
    const monthBtn = document.getElementById("billing-month");
    const yearBtn = document.getElementById("billing-year");

    let activeBillingPeriod = "month";
    let allPlans = [];

    const auth = new Auth({
      projectID: String(storeId)
    });

    function escapeHtml(value) {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function getChosenPrice(plan, billingPeriod) {
      if (!plan.prices || !Array.isArray(plan.prices) || plan.prices.length === 0) {
        return null;
      }

      let chosenPrice = plan.prices[0];

      for (const price of plan.prices) {
        if (price.billing_period === billingPeriod) {
          chosenPrice = price;
          break;
        }
      }

      return chosenPrice;
    }

    function renderPlans(plans) {
      if (!plans || plans.length === 0) {
        plansContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-warning mb-0">
              No active subscription plans were found.
            </div>
          </div>
        `;
        return;
      }

      plansContainer.innerHTML = plans
        .map((plan) => {
          const chosenPrice = getChosenPrice(plan, activeBillingPeriod);

          const featuresHtml = Array.isArray(plan.features) && plan.features.length > 0
            ? plan.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")
            : `<li>No features listed</li>`;

          let priceText = "Price not available";
          let priceId = "";

          if (chosenPrice) {
            priceId = chosenPrice.id;

            if (Number(chosenPrice.price) === 0) {
              priceText = "Free";
            } else {
              priceText = `${escapeHtml(chosenPrice.price_formatted)} / ${escapeHtml(chosenPrice.billing_period)}`;
            }
          }

          return `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="card h-100 shadow-sm border-0 rounded-4">
                <div class="card-body p-4 d-flex flex-column">
                  <h3 class="h4 fw-bold mb-3">${escapeHtml(plan.name)}</h3>
                  <p class="text-muted mb-3">${escapeHtml(plan.description || "No description available")}</p>

                  <ul class="mb-4">
                    ${featuresHtml}
                  </ul>

                  <div class="mt-auto">
                    <div class="fs-4 fw-bold mb-3">${priceText}</div>
                    <button
                      class="btn btn-dark w-100 subscribe-btn"
                      data-price-id="${escapeHtml(priceId)}"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      bindSubscribeButtons();
    }

    function bindSubscribeButtons() {
      const buttons = document.querySelectorAll(".subscribe-btn");

      buttons.forEach((button) => {
        button.addEventListener("click", async () => {
          const priceID = button.getAttribute("data-price-id");

          if (!priceID) {
            alert("This plan does not have a valid price.");
            return;
          }

          try {
            await auth.createSubscription({
              priceID: Number(priceID),
              paymentProvider
            });
          } catch (error) {
            console.error("Subscription error:", error);
            alert("There was a problem opening the subscription flow.");
          }
        });
      });
    }

    async function loadPlans() {
      try {
        plansContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-light border mb-0">
              Loading plans...
            </div>
          </div>
        `;

        const res = await fetch(`https://api.reflowhq.com/v2/projects/${storeId}/plans/`);

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        allPlans = response.data || [];

        console.log("Plans from Reflow:", allPlans);
        renderPlans(allPlans);
      } catch (error) {
        console.error("There was an error fetching the plans:", error);
        plansContainer.innerHTML = `
          <div class="col-12">
            <div class="alert alert-danger mb-0">
              There was an error loading the plans.
            </div>
          </div>
        `;
      }
    }

    monthBtn.addEventListener("click", () => {
      activeBillingPeriod = "month";
      monthBtn.className = "btn btn-dark btn-sm";
      yearBtn.className = "btn btn-outline-dark btn-sm";
      renderPlans(allPlans);
    });

    yearBtn.addEventListener("click", () => {
      activeBillingPeriod = "year";
      yearBtn.className = "btn btn-dark btn-sm";
      monthBtn.className = "btn btn-outline-dark btn-sm";
      renderPlans(allPlans);
    });

    await loadPlans();
  });
