// utils/csv.ts
export const exportToCSV = (filename: string, rows: any[], headers: string[]) => {
  if (!rows || rows.length === 0) return;

  const csvContent =
    [
      headers.join(","), // header row
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = row[key] ?? "";
            return `"${String(value).replace(/"/g, '""')}"`; // escape quotes
          })
          .join(","),
      ),
    ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};