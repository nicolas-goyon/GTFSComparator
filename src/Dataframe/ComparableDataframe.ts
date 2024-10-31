import { ZipEntry } from "unzipit";
import Dataframe from "./Dataframe";

export class ComparableDataframe extends Dataframe {
    private anomalies: Map<number, Map<string, boolean>>;

    constructor(header: string[], values: Map<string, string>[], anomalies: Map<number, Map<string, boolean>> = new Map()) {
        super(header, values);
        this.anomalies = anomalies;
    }

    static async fromZipEntry(entry: ZipEntry): Promise<ComparableDataframe> {
        const dataframe = await Dataframe.fromZipEntry(entry);
        return new ComparableDataframe(dataframe.getHeader(), dataframe.getValues());
    }

    static async fromCSV(csv: string, separator: string, endOfLine: string): Promise<ComparableDataframe> {
        const dataframe = await Dataframe.fromCSV(csv, separator, endOfLine);
        return new ComparableDataframe(dataframe.getHeader(), dataframe.getValues());
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

    consoleInfo() {
        super.consoleInfo();
        console.log('Anomalies:', this.anomalies);
    }

    
    static compare(df1: ComparableDataframe, df2: ComparableDataframe): void {
        const header1 = df1.getHeader();
        const header2 = df2.getHeader();
        const values1 = df1.getValues();
        const values2 = df2.getValues();

        if (header1.length !== header2.length) {
            throw new Error("Headers do not match in length.");
        }

        if (values1.length !== values2.length) {
            throw new Error("Values do not match in length.");
        }

        for (let i = 0; i < values1.length; i++) {
            const row1 = values1[i];
            const row2 = values2[i];

            for (const column of header1) {
                if (row1.get(column) !== row2.get(column)) {
                    df1.markAnomaly(i, column);
                    df2.markAnomaly(i, column);
                }
            }
        }
    }
}