const providers = {};

/**
 * Represents an interface for music providers.
 */
export interface Provider {
    type: string
    sources: "both" | "playlist" | "song"
}

/**
 * Represents an interface for providers that returns an url.
 */
export interface SourceProvider extends Provider {
    type: "source"
    getPlayUrl(): Promise<string>
}

/**
 * Add a provider.
 * @param id - ID of the provider.
 * @param provider - Instance of the provider.
 */
export function addProvider(id: string, provider: Provider) {
    providers[id] = provider;
}

export default providers;