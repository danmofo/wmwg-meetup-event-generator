import { Walk } from "./extract-walk-data.ts"

export type TemplateModel = {
    title: string,
    description: string,
    additional_notes: string,
    start_time: string,
    start_datetime: string,
    finish_datetime: string,
    start_point: string,
    postcode: string,
    google_maps_url: string,
    parking_text: string,
    food_text: string,
    walk_difficulty_text: string,
    ramblers_contact_url: string,
    original_walk_json: string,
    wmwg_website_url: string
}

export default function mapWalkToTemplateModel(walk: Walk): TemplateModel {
    const start = walk.start[0];

    return {
        title: `${walk.basics.title} - ${Math.floor(walk.walks[0].distanceMiles)} miles`,
        description: walk.basics.description,
        additional_notes: walk.basics.additionalNotes,
        start_time: start.timeHHMM,
        start_datetime: new Date(start.time.date).toLocaleString('en-GB'),
        finish_datetime: new Date(walk.basics.finishDate.date).toLocaleString('en-GB'),
        start_point: start.description,
        postcode: start.postcode.toUpperCase(),
        google_maps_url: `https://www.google.com/maps/dir/Current+Location/${start.latitude},${start.longitude}`,
        parking_text: hasParkingAvailable(walk) ? 'Yes, parking is available.' : 'The walk leader has not specified if parking is available',
        food_text: getFoodText(walk),
        walk_difficulty_text: getWalkDifficultyText(walk),
        ramblers_contact_url: walk.contact[0].contactForm,
        original_walk_json: JSON.stringify(walk, null, 4),
        wmwg_website_url: `https://www.wmwg.org.uk/walks.html?walkid=${walk.admin.id}`
    }
}

function hasParkingAvailable(walk: Walk) {
    const hasExplicitlySpecified = walk.flags.find(flag => flag.code === 'car-parking') !== undefined;
    if(hasExplicitlySpecified) {
        return true;
    }

    // Check some other places
    if(
        walk.basics.description.toLowerCase().includes('parking') || 
        walk.basics.additionalNotes.toLowerCase().includes('parking') || 
        walk.start[0].description.toLowerCase().includes('car park')) {
        return true;
    }
    
    return false;
}

function getFoodText(walk: Walk) {
    const distanceMiles = walk.walks[0].distanceMiles;
    if(distanceMiles <= 5) {
        return 'Snacks and water are recommended.'
    }
    return 'A packed lunch, snacks and water are recommended.'
}

function getWalkDifficultyText(walk: Walk) {
    const grade = walk.walks[0].nationalGrade;
    switch (grade) {
        case 'Leisurely':
            return 'This walk is leisurely and suitable for everyone.'
        case 'Moderate':
            return 'This walk is moderate and suitable for most people who have walked a few times. It should be doable by most people.'
        case 'Strenuous':
            return "This walk is strenuous and suitable for people who are active walkers. It may be long and/or contain a lot of ascent, so best avoided if you haven't walked before."
        default:
            return 'This walk is suitable for everyone.'
    }
}
