import file from "../provider/file";
import netease from "../provider/netease";
import qq from "../provider/qq";

let providers: Provider[] = [
    file, netease, qq
];

export function getProvider(type: string): Provider {
    for (let provider of providers)
        if (provider.type == type)
            return provider;
    return null;
}