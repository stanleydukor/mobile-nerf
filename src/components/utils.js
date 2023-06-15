export function getFileTypes(list) {
  const objFiles = list.filter((file) => String(file).endsWith(".obj"));
  const pngFiles = list.filter((file) => String(file).endsWith(".png"));
  const jsonFile = list.find((file) => typeof file === "object");
  return [objFiles, pngFiles, jsonFile];
}
