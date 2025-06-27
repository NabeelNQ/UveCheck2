document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the form page or the results page
    const form = document.getElementById('uveCheckForm');
    const resultContainer = document.getElementById('result-container');

    if (form) {
        // We are on the index.html page
        form.addEventListener('submit', handleFormSubmit);
    }

    if (resultContainer) {
        // We are on the results.html page
        displayResults();
    }
});

function handleFormSubmit(event) {
    event.preventDefault(); // Stop the default form submission

    const formData = new FormData(event.target);
    const params = new URLSearchParams();

    // Collect all form data and append to URL search parameters
    for (let [key, value] of formData.entries()) {
        params.append(key, value);
    }
    
    // Redirect to the results page with the data in the URL
    window.location.href = `results.html?${params.toString()}`;
}

function displayResults() {
    const params = new URLSearchParams(window.location.search);

    // Recreate the patient object from URL parameters
    const p = {
        countryChoice: parseInt(params.get('countryChoice')),
        ageAtOnset: parseInt(params.get('ageAtOnset')),
        yearsSinceOnset: parseFloat(params.get('yearsSinceOnset')),
        isANA_Positive: params.get('isANA_Positive') === 'true',
        isRF_Positive: params.get('isRF_Positive') === 'true',
        isSystemicOnset: params.get('isSystemicOnset') === 'true',
        isEnthesitisRelated: params.get('isEnthesitisRelated') === 'true',
    };

    // Calculate the recommendation string
    const recommendation = calculateRecommendation(p);

    // Get risk profile based on the recommendation
    const { riskCategory, riskIcon, riskClass } = getRiskProfile(recommendation);

    // Update the DOM with the results
    document.getElementById('risk-category').textContent = riskCategory;
    document.getElementById('recommendation-text').textContent = recommendation;
    document.getElementById('risk-banner').classList.add(riskClass);
    document.getElementById('risk-icon').textContent = riskIcon;
    
    // Display patient summary
    const guidelineNames = ["", "Nordic", "US and Pakistan", "UK", "Spain and Portugal", "Germany", "Czech and Slovakia", "Argentina", "MIWGUC"];
    document.getElementById('patient-summary').textContent = 
`Guideline: ${guidelineNames[p.countryChoice]}
Age at Onset: ${p.ageAtOnset}
Years Since Onset: ${p.yearsSinceOnset}
ANA Positive: ${p.isANA_Positive ? 'Yes' : 'No'}
RF Positive: ${p.isRF_Positive ? 'Yes' : 'No'}
Systemic Onset: ${p.isSystemicOnset ? 'Yes' : 'No'}
Enthesitis-Related: ${p.isEnthesitisRelated ? 'Yes' : 'No'}`;
}

// NEW FUNCTION: Maps recommendation string to a risk category
function getRiskProfile(recommendation) {
    let riskCategory = 'No Risk';
    let riskIcon = 'check_circle';
    let riskClass = 'no-risk';

    // Regex to find screening intervals
    if (/(2 months|3 months|3–4 months)/i.test(recommendation)) {
        riskCategory = 'High Risk';
        riskIcon = 'dangerous';
        riskClass = 'high-risk';
    } else if (/6 months/i.test(recommendation)) {
        riskCategory = 'Medium Risk';
        riskIcon = 'warning';
        riskClass = 'medium-risk';
    } else if (/12 months|indefinitely/i.test(recommendation)) {
        riskCategory = 'Low Risk';
        riskIcon = 'health_and_safety';
        riskClass = 'low-risk';
    }

    return { riskCategory, riskIcon, riskClass };
}


// --- Core Logic (Translated from your C code) ---
function calculateRecommendation(p) {
    // Common rule for Systemic or RF+ Polyarthritis
    if (p.isSystemicOnset || p.isRF_Positive) {
        return "Screen at diagnosis. Specific follow-up should be determined by an ophthalmologist.";
    }

    // Route to guideline function
    switch (p.countryChoice) {
        case 1: return nordicGuidelines(p);
        case 2: return usPakistanGuidelines(p);
        case 3: return ukGuidelines(p);
        case 4: return spainPortugalGuidelines(p);
        case 5: return germanyGuidelines(p);
        case 6: return czechSlovakGuidelines(p);
        case 7: return argentinaGuidelines(p);
        case 8: return miwgucGuidelines(p);
        default: return "Invalid guideline selected.";
    }
}

function nordicGuidelines(p) {
    if (p.ageAtOnset < 7) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 4) return "Screen every 3 months";
            if (p.yearsSinceOnset <= 7) return "Screen every 6 months";
            return "Screen every 12 months indefinitely";
        } else {
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            if (p.yearsSinceOnset <= 7) return "Screen every 12 months";
            return "Screen every 12 months indefinitely";
        }
    } else {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            if (p.yearsSinceOnset <= 7) return "Screen every 12 months";
            return "Screen every 12 months indefinitely";
        } else {
            if (p.yearsSinceOnset <= 7) return "Screen every 12 months";
            return "Screen every 12 months indefinitely";
        }
    }
}

function usPakistanGuidelines(p) {
    if (p.ageAtOnset < 3) {
        if (p.yearsSinceOnset < 0.5) return "Screen every 2 months";
        if (p.yearsSinceOnset < 3) return "Screen every 3–4 months";
    } else if (p.ageAtOnset < 9) {
        if (p.yearsSinceOnset < 0.5) return "Screen every 2 months";
        if (p.yearsSinceOnset < 6) return "Screen every 3–4 months";
    } else {
        if (p.yearsSinceOnset < 0.5) return "Screen every 2 months";
        if (p.yearsSinceOnset < 5) return "Screen every 3–4 months";
    }
    return "Screening interval not specified for these parameters; consult guidelines.";
}

function ukGuidelines(p) {
    if (p.ageAtOnset <= 6) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 2) return "Screen every 3 months";
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            return "Screen every 12 months until 16 years of age";
        } else {
            if (p.yearsSinceOnset <= 2) return "Screen every 6 months";
            return "Screen every 12 months until 16 years of age";
        }
    } else {
        if (p.yearsSinceOnset <= 2) return "Screen every 6 months";
        return "Screen every 12 months until 16 years of age";
    }
}

function spainPortugalGuidelines(p) {
    if (p.ageAtOnset <= 6) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 2) return "Screen every 3 months";
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            return "Screen every 12 months (7-year follow-up)";
        } else {
            if (p.yearsSinceOnset <= 2) return "Screen every 6 months";
            return "Screen every 12 months (7-year follow-up)";
        }
    } else {
        if (p.yearsSinceOnset <= 2) return "Screen every 6 months";
        return "Screen every 12 months (7-year follow-up)";
    }
}

function germanyGuidelines(p) {
    if (p.ageAtOnset < 6) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 0.5) return "Screen every 2 months";
            if (p.yearsSinceOnset <= 4) return "Screen every 3 months";
            return "Screen every 6 months until 18 years";
        } else {
            if (p.yearsSinceOnset <= 4) return "Screen every 3 months";
            return "Screen every 6 months until 18 years";
        }
    } else {
        return "Screen every 6 months until 18 years";
    }
}

function czechSlovakGuidelines(p) {
    if (p.ageAtOnset <= 6) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 4) return "Screen every 3 months";
            if (p.yearsSinceOnset <= 7) return "Screen every 6 months";
            return "Screen every 12 months until 21 years";
        } else {
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            return "Screen every 12 months until 21 years";
        }
    } else {
        return "Screen every 12 months until 21 years";
    }
}

function argentinaGuidelines(p) {
    if (p.ageAtOnset < 7) {
        if (p.yearsSinceOnset <= 1) return "Screen every 2 months";
        if (p.yearsSinceOnset <= 4) return "Screen every 3–4 months";
        if (p.yearsSinceOnset <= 7) return "Screen every 6 months";
        return "Screen every 12 months indefinitely";
    } else {
        if (p.yearsSinceOnset <= 1) return "Screen every 3–4 months";
        if (p.yearsSinceOnset <= 7) return "Screen every 6–12 months";
        return "Screen every 12 months indefinitely";
    }
}

function miwgucGuidelines(p) {
    if (p.ageAtOnset <= 6) {
        if (p.isANA_Positive) {
            if (p.yearsSinceOnset <= 2) return "Screen every 3 months";
            if (p.yearsSinceOnset <= 4) return "Screen every 6 months";
            if (p.yearsSinceOnset <= 7) return "Screen every 12 months";
            return "Screen every 12 months until 16 years";
        } else {
            return "Screen every 12 months until 16 years";
        }
    } else {
        return "Screen every 12 months until 16 years";
    }
}