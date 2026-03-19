import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface CsvColumn {
  key: string;
  header: string;
}

export async function exportToCsv(filename: string, rows: Record<string, unknown>[], columns: CsvColumn[]) {
  const header = columns.map((c) => c.header).join(',');
  const csvRows = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key] ?? '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  const csv = [header, ...csvRows].join('\n');
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
  }
}
