import extractWalkData from "./extract-walk-data.ts";

const walks = await extractWalkData('https://www.wmwg.org.uk/walks.html');

console.log(`Found ${walks.length} walks.`);