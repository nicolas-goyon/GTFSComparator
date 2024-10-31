import { ZipEntry } from "unzipit";
import Dataframe from "./Dataframe";


export class IdentifiableDataframe {
    private header: string[];
    private values: Map<string, string>[];
    private idColumn: string;
    private anomalies: Map<number, Map<string, boolean>>;
    private extraRows: Set<number>;

    constructor(header: string[], values: Map<string, string>[], anomalies: Map<number, Map<string, boolean>> = new Map(), extraRows: Set<number> = new Set()) {
        this.header = header;
        this.values = values;
        this.idColumn = '';
        this.anomalies = anomalies;
        this.extraRows = extraRows;
    }

    static async fromZipEntry(entry: ZipEntry): Promise<IdentifiableDataframe> {
        const dataframe = await Dataframe.fromZipEntry(entry);
        return new IdentifiableDataframe(dataframe.getHeader(), dataframe.getValues());
    }

    static async fromCSV(csv: string, separator: string, endOfLine: string, idColumn: string): Promise<IdentifiableDataframe> {
        const dataframe = await Dataframe.fromCSV(csv, separator, endOfLine);
        return new IdentifiableDataframe(dataframe.getHeader(), dataframe.getValues());
    }

    getHeader(): string[] {
        return this.header;
    }

    getValues(): Map<string, string>[] {
        return this.values;
    }

    getIdColumn(): string {
        return this.idColumn;
    }

    markAnomaly(rowIndex: number, columnName: string) {
        if (!this.anomalies.has(rowIndex)) {
            this.anomalies.set(rowIndex, new Map<string, boolean>());
        }
        this.anomalies.get(rowIndex)!.set(columnName, true);
    }

    isAnomaly(rowIndex: number, columnName: string): boolean {
        return this.anomalies.has(rowIndex) && this.anomalies.get(rowIndex)!.has(columnName);
    }

    getAnomalies(): Map<number, Map<string, boolean>> {
        return this.anomalies;
    }

    markExtraRow(rowIndex: number) {
        this.extraRows.add(rowIndex);
    }

    isExtraRow(rowIndex: number): boolean {
        return this.extraRows.has(rowIndex);
    }

    getExtraRows(): Set<number> {
        return this.extraRows;
    }


    set(idColumn: string) {
        this.idColumn = idColumn;
    }

    static compare(df1: IdentifiableDataframe, df2: IdentifiableDataframe): void {
        const idColumn1 = df1.getIdColumn();
        const idColumn2 = df2.getIdColumn();

        if (idColumn1 !== idColumn2) {
            throw new Error("ID columns do not match.");
        }

        const values1 = df1.getValues();
        const values2 = df2.getValues();

        const idMap1 = new Map<string, Map<string, string>>();
        const idMap2 = new Map<string, Map<string, string>>();

        values1.forEach((row, index) => {
            const id = row.get(idColumn1);
            if (id !== undefined) {
                idMap1.set(id, row);
            }
        });

        values2.forEach((row, index) => {
            const id = row.get(idColumn2);
            if (id !== undefined) {
                idMap2.set(id, row);
            }
        });

        for (const [id, row1] of idMap1.entries()) {
            const row2 = idMap2.get(id);
            if (row2) {
                for (const column of df1.getHeader()) {
                    if (row1.get(column) !== row2.get(column)) {
                        const rowIndex1 = Array.from(values1).findIndex(row => row.get(idColumn1) === id);
                        const rowIndex2 = Array.from(values2).findIndex(row => row.get(idColumn2) === id);
                        df1.markAnomaly(rowIndex1, column);
                        df2.markAnomaly(rowIndex2, column);
                    }
                }
            } else {
                const rowIndex1 = Array.from(values1).findIndex(row => row.get(idColumn1) === id);
                df1.markExtraRow(rowIndex1);
            }
        }

        for (const [id, row2] of idMap2.entries()) {
            const row1 = idMap1.get(id);
            if (!row1) {
                const rowIndex2 = Array.from(values2).findIndex(row => row.get(idColumn2) === id);
                df2.markExtraRow(rowIndex2);
            }
        }
    }
}