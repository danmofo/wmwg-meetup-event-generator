import { TemplateModel } from "./map-walk-to-template-model.ts";

export type MergedTemplate = {
    model: TemplateModel,
    html: string
}

export default function mergeModelWithTemplate(templateHtml: string, model: TemplateModel): MergedTemplate {
    let html = templateHtml;

    for (const [key, value] of Object.entries(model)) {
        html = html.replaceAll(`{${key}}`, value);
    }

    return {
        model: model,
        html: html
    }
}