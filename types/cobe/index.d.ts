import "cobe";

declare module "cobe" {
  interface COBEOptions {
    // Present at runtime per cobe docs, but missing in published typings.
    onRender?: (state: COBEOptions) => void;
  }
}
