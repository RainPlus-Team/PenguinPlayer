declare module "*.svg" {
    const comp: new() => import("preact").Component<{className?: string}, Record<string, never>>;
    export default comp;
}