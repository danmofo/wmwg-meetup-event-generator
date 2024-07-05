import extractWalkData from "./extract-walk-data.ts";
import mapWalkToTemplateModel from "./map-walk-to-template-model.ts";
import mergeModelWithTemplate from "./merge-model-with-template.ts";

const walks = await extractWalkData('https://www.wmwg.org.uk/walks.html');
console.log(`Found ${walks.length} walks.`);

const templateHtml = await Deno.readTextFile('./template.html');

walks.forEach(async walk => {
    const templateModel = mapWalkToTemplateModel(walk);
    const template = mergeModelWithTemplate(templateHtml, templateModel);
    const outputPath = `./output/${template.model.title}.html`;

    await Deno.writeFile(outputPath, new TextEncoder().encode(template.html));
});