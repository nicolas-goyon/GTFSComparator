import React, { useRef } from 'react'
import './App.css'
import { GTFS, GTFSRef } from './GTFS/GTFS'
import { ComparableDataframe } from './Dataframe/ComparableDataframe'
import { IdentifiableDataframe } from './Dataframe/IdentifiableDataframe'


function App() {
    const gtfs1Ref = useRef<GTFSRef>(null)
    const gtfs2Ref = useRef<GTFSRef>(null)

    const compareFirst = async () => {
        const gtfs1 = gtfs1Ref.current
        const gtfs2 = gtfs2Ref.current

        if (!gtfs1 || !gtfs2){
            alert("Une erreur est survenue")
            return
        }

        if (!gtfs1.isDataFilled() || !gtfs2.isDataFilled()) {
            alert("Veuillez remplir les deux GTFS")
            return
        }

        const data1 = gtfs1.getData().get("stops.txt")
        const data2 = gtfs2.getData().get("stops.txt")

        if (!data1 || !data2){
            alert("Le mot clé stops.txt n'existe pas")
            return
        }

        IdentifiableDataframe.compare(data1, data2)

        gtfs1.setData("stops.txt", data1)
        gtfs2.setData("stops.txt", data2)

        alert("Comparaison terminée")
    }

    
    const compareOne = async (df1: IdentifiableDataframe, df2: IdentifiableDataframe, key: string) => {
        if (!df1 || !df2) {
            alert("Une erreur est survenue");
            return;
        }

        IdentifiableDataframe.compare(df1, df2);


        const gtfs1 = gtfs1Ref.current
        const gtfs2 = gtfs2Ref.current

        if (!gtfs1 || !gtfs2){
            alert("Une erreur est survenue")
            return
        }

        gtfs1.setData(key, df1)
        gtfs2.setData(key, df2)

        // alert("Comparaison terminée");
    };



    const compareAll = async () => {
        const gtfs1 = gtfs1Ref.current;
        const gtfs2 = gtfs2Ref.current;

        if (!gtfs1 || !gtfs2) {
            alert("Une erreur est survenue");
            return;
        }

        if (!gtfs1.isDataFilled() || !gtfs2.isDataFilled()) {
            alert("Veuillez remplir les deux GTFS");
            return;
        }

        const data1 = gtfs1.getData();
        const data2 = gtfs2.getData();

        for (const [key, df1] of data1.entries()) {
            const df2 = data2.get(key);
            if (df2) {
                compareOne(df1, df2, key);

                
            } else {
                alert(`Le mot clé ${key} n'existe pas dans le second GTFS`);
            }
        }

        alert("Comparaison de tous les DataFrames terminée");
    };

    const handleIdChangeRef1: (dataframeKey: string, column: string) => void = (dataframeKey: string, column: string) => {
        if (!gtfs2Ref.current) {
            alert("Unexpected error");
            return
        }
        gtfs2Ref.current.setId(dataframeKey, column);
    }
    
    const handleIdChangeRef2: (dataframeKey: string, column: string) => void = (dataframeKey: string, column: string) => {
        if (!gtfs1Ref.current) {
            alert("Unexpected error");
            return
        }
        gtfs1Ref.current.setId(dataframeKey, column);
    }


    return (
        <>
        <div className="">
            <div className="flex flex-row justify-center py-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl">Comparaison de GTFS</h1>
                    <button
                        onClick={() => compareAll()}
                        className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg duration-150 hover:bg-indigo-100 active:bg-indigo-200"
                    >
                        Comparer
                    </button>
                </div>
            </div>
            <div className="flex flex-row gap-4 p-4">   
                <div className='flex flex-col w-1/2'>
                    <GTFS ref={gtfs1Ref} title="Premier GTFS" idChanged={handleIdChangeRef1}/>
                </div>
                <div className='flex flex-col w-1/2'>
                    <GTFS ref={gtfs2Ref} title="Second GTFS" idChanged={handleIdChangeRef2}/>
                </div>
            </div>
        </div>
        </>
    )
}

export default App
