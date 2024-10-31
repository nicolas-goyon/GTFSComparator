import { ZipEntry } from "unzipit";

export default class Dataframe {
    private header: string[];
    private values: Map<string, string>[];

    constructor(header: string[], values: Map<string, string>[]) {
        this.header = header;
        this.values = values;
    }

    static async fromZipEntry(entry:ZipEntry) : Promise<Dataframe> {
        const text = await entry.text();
        return Dataframe.fromCSV(text, ',', '\n');
    }

    static async fromCSV(csv:string, separator: string, endOfLine: string) : Promise<Dataframe> {
        const lines = csv.split(endOfLine);
        const header = lines[0].split(separator);
        const data = lines.slice(1).map(line => line.split(separator));

        // Clean data, remove empty lines
        const cleanedData = data.filter(row => row.length === header.length);

        const values : Map<string, string>[] = [];
        cleanedData.forEach(row => {
            const rowMap = new Map<string, string>();
            row.forEach((value, index) => {
                rowMap.set(header[index], value);
            });
            values.push(rowMap);
        });

        return new Dataframe(header, values);
    }


    getHeader() : string[] {
        return this.header;
    }

    getValues() : Map<string, string>[] {
        return this.values;
    }

    consoleInfo(){
        console.log('Header:', this.header);
        console.info('Values:', this.values);
    }
}