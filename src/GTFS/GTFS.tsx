import React, { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { readFilesFile } from "../Unzip/Unzip";
import Dropzone, {DropzoneProps} from "../Dropzone/Dropzone";
import Table from "../Table/Table";
import { IdentifiableDataframe } from "../Dataframe/IdentifiableDataframe";
import Observable from "../Observable/Observable";

interface GTFSRef {
    isDataFilled: () => boolean;
    getData: () => Map<string, IdentifiableDataframe>;
    setData: (key: string, data: IdentifiableDataframe) => void;
    setId: (dataframeKey: string, column: string) => void;
}

export {GTFSRef}

interface GTFSProps{
    title: String
    idChanged: (dataframeKey: string, column: string) => void
}

export const GTFS = forwardRef<GTFSRef, GTFSProps>((props: GTFSProps, ref) => {
    const [dfs, setDfs] = React.useState<Map<string, IdentifiableDataframe>>(new Map());
    const [reloadKey, setReloadKey] = useState(0); // État pour forcer le rechargement
    const observable : Observable<string> = new Observable();
    
    const reload = () => {
        setReloadKey(prevKey => prevKey + 1)
    }



    
    const fileDropCallback = async (file: File) => {
        const entries = await readFilesFile(file);

        const data: Map<string, IdentifiableDataframe> = new Map();
        for (const [name, entry] of Object.entries(entries)) {
            const df = await IdentifiableDataframe.fromZipEntry(entry);
            data.set(name, df);
        }
        setDfs(data);
    };

    
    const handleIdSelect = (name: string, idColumn: string) => {
        const df = dfs.get(name);
        if (!df) {
            alert("Dataframe not found in idSelect");
            return;
        }
        df.set(idColumn);
        props.idChanged(name,idColumn)
    };

    useImperativeHandle(ref, () => ({
        isDataFilled: () => dfs.size > 0,
        getData: () => dfs,
        setData: (key: string, data: IdentifiableDataframe) => {
            const newData = dfs
            newData[key] = data
            setDfs(newData)
            reload()
        },
        setId(dataframeKey: string, column:string) {
            const df = dfs.get(dataframeKey);
            if (!df) {
                alert("Dataframe not found in setId");
                return;
            }
            df.set(column);
            observable.notify(dataframeKey,column)
            reload()
        },
    }));

    const displayTables = () => {
        // Sort names alphabetically
        const orderedDfs = Array.from(dfs.entries()).sort(([name1], [name2]) => name1.localeCompare(name2));

        return orderedDfs.map(([name, df]) => (
            <Table key={name} name={name} df={df} onIdSelect={handleIdSelect} observable={observable} />
        ));
    }


    return (
        <div className="flex flex-col">
            <div className="text-3xl text-center">
                {props.title}
            </div>
            <div className="flex flex-row justify-center py-4">
                <Dropzone callbackWhenFileDropped={fileDropCallback} text={props.title}/>
            </div>
            <div className="flex flex-row justify-center py-4">
                <div className="flex flex-col gap-4 p-4 w-full">
                    {displayTables()}
                </div>
            </div>


        </div>
    );
});