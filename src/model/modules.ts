/** How many path segments to group symbols into a Module (a navigable folder
 *  bucket): `app/components/x/y` with depth 2 -> `app/components`. Used by the
 *  Graph Explorer to cluster the graph into ~dozens of super-nodes. */
export const MODULE_GROUP_DEPTH = 2;

/** The Module a source path belongs to: its first N path segments. */
export function moduleGroup(
  module: string,
  depth = MODULE_GROUP_DEPTH,
): string {
  if (module === '.' || module === '') {
    return '(root)';
  }

  return module.split('/').slice(0, depth).join('/');
}
