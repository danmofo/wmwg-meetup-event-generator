import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";

/**
 * This function extracts walk data from a WMWG walking page. 
 * 
 * The data is inside a variable named 'data' in a <script> tag, it looks like this:
 * 
 * <script>
 * window.addEventListener('load', function() {
 *      var mapOptions = {};
 *      var data = '{\"walks\": []}'
 * });
 * 
 * window.addEventListener('load', function() {
 *      var mapOptions = {...};
 *      var data = '{\"walks\": [{\"admin\": ...rest of data ... }]}'
 * });
 * </script>
 * 
 * The first event handler contains the same variables, they just don't have any data in, we're looking specifically for the 
 * second 'data' definition.
 * 
 * ...yep, it's crap, but that's the only place to fetch this data from.
 * 
 * @param walkPageUrl The page to extract walk data from
 * @returns An array of walks
 */


export type Walk = {
    basics: BasicMetadata,
    start: Start[],
    flags: Flag[],
    contact: Contact[],
    walks: WalkData[]
}

type Flag = {
    section: string,
    code: string,
    name: string
}

type Contact = {
    contactForm: string
}

type Start = {
    timeHHMM: string,
    description: string,
    latitude: number,
    longitude: number,
    postcode: string
}

type BasicMetadata = {
    walkDate: Date,
    startDate: Date,
    finishDate: Date,
    title: string,
    description: string,
    additionalNotes: string
}

type Date = {
    date: string,
    timezone_type: number,
    timezone: string
}

type WalkData = {
    nationalGrade: string,
    distanceMiles: number,
}

export default async function extractWalkData(walkPageUrl: string): Promise<Array<Walk>> {
    console.log('Extracting walk data from: ' + walkPageUrl);

    const resp = await fetch(walkPageUrl);
    const html = await resp.text();
    const document = new DOMParser().parseFromString(html, 'text/html');

    // Find the <script> tag with the 'data' variable in
    const [ script ] = Array.from(document.querySelectorAll('script')).filter(script => {
        return script.innerHTML.includes(`var data=`);
    });

    if(!script) {
        console.log('Failed to find <script> with "var data=" in - the page HTML may have changed.');
        Deno.exit(1);
    }

    // Find the 'data' variable which has data in, there are multiple 'data' variables in this script block, but only one of them has data in.
    // The real one looks like {walks: [{ ... some data ...}]}
    // The empty one looks like {walks: []}
    const jsonRegex = /'{\\"walks\\":\[{\\"admin.+'/gm;
    const [ match ] = script.innerHTML.match(jsonRegex);

    // Now we have the data, it looks like this:
    // '{\"fieldName\": \"fieldValue\"}'
    const jsonStr = match
        // Remove single quotes from either side
        .substr(1, match.length - 2)
        // Unescape the double quotes
        .replaceAll("\\\"", "\"")
        // Unescape the single quotes
        .replaceAll("\\\'", "\'")
        // Remove unicode spaces
        .replaceAll('\\\\u00a0', " ")
        // Unescape the forward slashes
        .replaceAll("\\\\", "");

    // Finally! We have our data
    const { walks } = JSON.parse(jsonStr);

    return walks;
}