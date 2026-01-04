/**
 * codemods/replace-console-with-serverLogger.js
 *
 * Replaces console.error(...) -> serverLogger.error(...)
 * and console.warn(...)  -> serverLogger.warn(...)
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Replace console.error(...) -> serverLogger.error(...)
  root
    .find(j.CallExpression, {
      callee: { object: { name: "console" }, property: { name: "error" } },
    })
    .forEach(path => {
      const args = path.node.arguments;
      const newCallee = j.memberExpression(j.identifier("serverLogger"), j.identifier("error"));
      j(path).replaceWith(j.callExpression(newCallee, args));
    });

  // Replace console.warn(...) -> serverLogger.warn(...)
  root
    .find(j.CallExpression, {
      callee: { object: { name: "console" }, property: { name: "warn" } },
    })
    .forEach(path => {
      const args = path.node.arguments;
      const newCallee = j.memberExpression(j.identifier("serverLogger"), j.identifier("warn"));
      j(path).replaceWith(j.callExpression(newCallee, args));
    });

  return root.toSource({ quote: "single" });
}
