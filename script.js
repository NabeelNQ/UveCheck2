document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    const form = document.getElementById('uveCheckForm');
    const resultContainer = document.querySelector('.risk-slider-container');
    const introPage = document.querySelector('.about-section');

    if (form) {
        // We are on form.html
        initializeForm();
        form.addEventListener('submit', handleFormSubmit);
    } else if (resultContainer) {
        // We are on results.html
        displayResults();
    }
    // No specific JS needed for index.html
});

// NEW: Pre-fill today's date on the form
function initializeForm() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('currentDate').value = `${yyyy}-${mm}-${dd}`;
}

// NEW: Function to calculate age in years from two date strings
function calculateYearsBetween(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = Math.abs(d2 - d1);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // NEW: Calculate age at onset and years since onset from dates
    const ageAtOnset = Math.floor(calculateYearsBetween(data.dob, data.diagnosisDate));
    const yearsSinceOnset = calculateYearsBetween(data.diagnosisDate, data.currentDate);

    // Create parameters for the URL
    const params = new URLSearchParams();
    params.append('countryChoice', data.countryChoice);
    params.append('isANA_Positive', data.isANA_Positive);
    params.append('isRF_Positive', data.isRF_Positive);
    params.append('isSystemicOnset', data.isSystemicOnset);
    params.append('isEnthesitisRelated', data.isEnthesitisRelated);
    params.append('ageAtOnset', ageAtOnset);
    params.append('yearsSinceOnset', yearsSinceOnset.toFixed(1)); // Send with one decimal place
    
    window.location.href = `results.html?${params.toString()}`;
}

function displayResults() {
    const params = new URLSearchParams(window.location.search);
    const p = {
        countryChoice: parseInt(params.get('countryChoice')),
        ageAtOnset: parseInt(params.get('ageAtOnset')),
        yearsSinceOnset: parseFloat(params.get('yearsSinceOnset')),
        isANA_Positive: params.get('isANA_Positive') === 'true',
        isRF_Positive: params.get('isRF_Positive') === 'true',
        isSystemicOnset: params.get('isSystemicOnset') === 'true',
        isEnthesitisRelated: params.get('isEnthesitisRelated') === 'true',
    };

    const recommendation = calculateRecommendation(p);
    const profile = getRiskProfile(recommendation);

    // Update the slider/thumb
    document.getElementById('risk-thumb').classList.add(profile.positionClass);
    document.getElementById('risk-thumb-letter').textContent = profile.letter;

    // Update the result text
    document.getElementById('result-category-text').textContent = profile.categoryText;
    document.getElementById('result-recommendation-text').textContent = profile.recommendationText;
}

// UPDATED: Maps recommendation to a risk profile for the new UI
function getRiskProfile(recommendation) {
    // Defaults for No Risk / Not specified
    let profile = {
        letter: 'N',
        positionClass: 'pos-none',
        categoryText: 'Patient falls into the no-risk category.',
        recommendationText: 'Patient does not have to undergo any screening.'
    };
    
    // Check for explicit "no screening" or special cases first
    if (recommendation.includes("not specified") || recommendation.includes("No screening")) {
        return profile;
    }

    if (/(2 months|3 months|3–4 months)/i.test(recommendation)) {
        profile = {
            letter: 'H',
            positionClass: 'pos-high',
            categoryText: 'Patient falls into the high-risk category.',
            recommendationText: 'Patient is advised to undergo uveitis screening at a 3-month interval.'
        };
    } else if (/6 months|6–12 months/i.test(recommendation)) {
         profile = {
            letter: 'M',
            positionClass: 'pos-medium',
            categoryText: 'Patient falls into the medium-risk category.',
            recommendationText: 'Patient is advised to undergo uveitis screening at a 6-month interval.'
        };
    } else if (/12 months|indefinitely/i.test(recommendation)) {
         profile = {
            letter: 'L',
            positionClass: 'pos-low',
            categoryText: 'Patient falls into the low-risk category.',
            recommendationText: 'Patient is advised to undergo uveitis screening at a 12-month interval.'
        };
    } else if (recommendation.includes("Screen at diagnosis")) {
         profile = {
            letter: 'H',
            positionClass: 'pos-high',
            categoryText: 'Patient requires immediate screening.',
            recommendationText: 'Screen at diagnosis. Specific follow-up should be determined by an ophthalmologist.'
        };
    }

    return profile;
}

// --- Core Guideline Logic (Translated from C code) ---
// Note: This logic remains the same as before.
function calculateRecommendation(p) {
    if (p.isSystemicOnset || p.isRF_Positive) {
        return "Screen at diagnosis. Specific follow-up should be determined by an ophthalmologist.";
    }
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
function nordicGuidelines(p){if(p.ageAtOnset<7){if(p.isANA_Positive){if(p.yearsSinceOnset<=4)return"Screen every 3 months";if(p.yearsSinceOnset<=7)return"Screen every 6 months";return"Screen every 12 months indefinitely"}else{if(p.yearsSinceOnset<=4)return"Screen every 6 months";if(p.yearsSinceOnset<=7)return"Screen every 12 months";return"Screen every 12 months indefinitely"}}else{if(p.isANA_Positive){if(p.yearsSinceOnset<=4)return"Screen every 6 months";if(p.yearsSinceOnset<=7)return"Screen every 12 months";return"Screen every 12 months indefinitely"}else{if(p.yearsSinceOnset<=7)return"Screen every 12 months";return"Screen every 12 months indefinitely"}}}
function usPakistanGuidelines(p){if(p.ageAtOnset<3){if(p.yearsSinceOnset<0.5)return"Screen every 2 months";if(p.yearsSinceOnset<3)return"Screen every 3–4 months"}else if(p.ageAtOnset<9){if(p.yearsSinceOnset<0.5)return"Screen every 2 months";if(p.yearsSinceOnset<6)return"Screen every 3–4 months"}else{if(p.yearsSinceOnset<0.5)return"Screen every 2 months";if(p.yearsSinceOnset<5)return"Screen every 3–4 months"}return"Screening interval not specified for these parameters; consult guidelines."}
function ukGuidelines(p){if(p.ageAtOnset<=6){if(p.isANA_Positive){if(p.yearsSinceOnset<=2)return"Screen every 3 months";if(p.yearsSinceOnset<=4)return"Screen every 6 months";return"Screen every 12 months until 16 years of age"}else{if(p.yearsSinceOnset<=2)return"Screen every 6 months";return"Screen every 12 months until 16 years of age"}}else{if(p.yearsSinceOnset<=2)return"Screen every 6 months";return"Screen every 12 months until 16 years of age"}}
function spainPortugalGuidelines(p){if(p.ageAtOnset<=6){if(p.isANA_Positive){if(p.yearsSinceOnset<=2)return"Screen every 3 months";if(p.yearsSinceOnset<=4)return"Screen every 6 months";return"Screen every 12 months (7-year follow-up)"}else{if(p.yearsSinceOnset<=2)return"Screen every 6 months";return"Screen every 12 months (7-year follow-up)"}}else{if(p.yearsSinceOnset<=2)return"Screen every 6 months";return"Screen every 12 months (7-year follow-up)"}}
function germanyGuidelines(p){if(p.ageAtOnset<6){if(p.isANA_Positive){if(p.yearsSinceOnset<=0.5)return"Screen every 2 months";if(p.yearsSinceOnset<=4)return"Screen every 3 months";return"Screen every 6 months until 18 years"}else{if(p.yearsSinceOnset<=4)return"Screen every 3 months";return"Screen every 6 months until 18 years"}}else{return"Screen every 6 months until 18 years"}}
function czechSlovakGuidelines(p){if(p.ageAtOnset<=6){if(p.isANA_Positive){if(p.yearsSinceOnset<=4)return"Screen every 3 months";if(p.yearsSinceOnset<=7)return"Screen every 6 months";return"Screen every 12 months until 21 years"}else{if(p.yearsSinceOnset<=4)return"Screen every 6 months";return"Screen every 12 months until 21 years"}}else{return"Screen every 12 months until 21 years"}}
function argentinaGuidelines(p){if(p.ageAtOnset<7){if(p.yearsSinceOnset<=1)return"Screen every 2 months";if(p.yearsSinceOnset<=4)return"Screen every 3–4 months";if(p.yearsSinceOnset<=7)return"Screen every 6 months";return"Screen every 12 months indefinitely"}else{if(p.yearsSinceOnset<=1)return"Screen every 3–4 months";if(p.yearsSinceOnset<=7)return"Screen every 6–12 months";return"Screen every 12 months indefinitely"}}
function miwgucGuidelines(p){if(p.ageAtOnset<=6){if(p.isANA_Positive){if(p.yearsSinceOnset<=2)return"Screen every 3 months";if(p.yearsSinceOnset<=4)return"Screen every 6 months";if(p.yearsSinceOnset<=7)return"Screen every 12 months";return"Screen every 12 months until 16 years"}else{return"Screen every 12 months until 16 years"}}else{return"Screen every 12 months until 16 years"}}