import * as path from "https://deno.land/std@0.188.0/path/mod.ts";
import { pad } from "https://deno.land/std@0.35.0/strings/mod.ts";

import extractWalkData, { Walk } from "./extract-walk-data.ts";
import mapWalkToTemplateModel from "./map-walk-to-template-model.ts";
import mergeModelWithTemplate from "./merge-model-with-template.ts";

const walks = await extractWalkData('https://www.wmwg.org.uk/walks.html');
if(walks.length === 0) {
    console.log('No walks found - the walk page HTML may have been updated/changed.');
    Deno.exit(1);
}

console.log(`Found ${walks.length} walks.`);

await writeWalkTemplates(walks);

const indexPageUrl = `file://${path.dirname(path.fromFileUrl(import.meta.url))}/output/`;
console.log(`View the templates in your browser at: ${indexPageUrl}`);


async function writeWalkTemplates(walks: Walk[]) {
    console.log('Writing walk templates...');

    const templateHtml = await Deno.readTextFile('./template.html');

    for(const [index, walk] of walks.entries()) {
        const templateModel = mapWalkToTemplateModel(walk);
        const template = mergeModelWithTemplate(templateHtml, templateModel);

        const filePrefix = pad(index.toString(), 3, {char: '0', side: 'left'});
        const outputPath = `./output/${filePrefix}_${template.model.title}.html`;
        
        console.log(`Writing: ${outputPath}`);
        await Deno.writeFile(outputPath, new TextEncoder().encode(template.html));
    }

    console.log('Done writing templates.');
}