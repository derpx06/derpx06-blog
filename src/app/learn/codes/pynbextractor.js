import fs from "fs";

const nb = JSON.parse(fs.readFileSync("lcel.ipynb", "utf8"));

const cell = nb.cells[4]; // 5th cell
if (!cell) {
  throw new Error("Cell does not exist");
}

const input = cell.source.join("");

let output = null;

if (cell.cell_type === "code" && Array.isArray(cell.outputs)) {
  output = cell.outputs
    .map((o) => {
      if (o.output_type === "stream") {
        return o.text.join("");
      }
      if (o.output_type === "execute_result" || o.output_type === "display_data") {
        return o.data?.["text/plain"]?.join("") ?? "";
      }
      if (o.output_type === "error") {
        return o.traceback.join("\n");
      }
      return "";
    })
    .join("");
}

console.log({ input, output });
