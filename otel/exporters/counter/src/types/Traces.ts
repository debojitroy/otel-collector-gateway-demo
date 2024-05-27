import {Attribute} from "./Attribute";
import {Span} from "./Span";

export interface ResourceSpans {
    resource: {
        attributes: Attribute[]
    }
    scopeSpans: ScopeSpans[];
    schemaUrl: string;
}

export interface ScopeSpans {
    scope: {
        name: string;
    };
    spans: Span[];
}

export interface Traces {
    resourceSpans: ResourceSpans[]
}