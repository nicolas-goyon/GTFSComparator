import React, { useEffect, useRef, useState } from "react";
import { IdentifiableDataframe } from "../Dataframe/IdentifiableDataframe";
import { v4 } from "uuid";
import Observable from "../Observable/Observable";

interface TableProps {
    name: string;
    df: IdentifiableDataframe;
    onIdSelect: (name: string, idColumn: string) => void;
    observable: Observable<string>;
}

const Table: React.FC<TableProps> = ({ name, df, onIdSelect, observable }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedIdColumn, setSelectedIdColumn] = useState<string | null>(null);
    const rowsToShow = expanded ? df.getValues().length : 5;

    observable.subscribe(name,(newId: string) => {
        
        setSelectedIdColumn(newId)
    })

    const handleIdSelect = (idColumn: string) => {
        setSelectedIdColumn(idColumn);
        onIdSelect(name, idColumn);
    };

    const id = v4()

    const identificationRef = useRef<HTMLUListElement>(null);
    const tableValuesRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleScroll = (e: Event) => {
            const source = e.target as HTMLElement;
            const target = source === identificationRef.current ? tableValuesRef.current : identificationRef.current;
    
            if (source && target) {
                const scrollPercentage = source.scrollLeft / (source.scrollWidth - source.clientWidth);
                target.scrollLeft = scrollPercentage * (target.scrollWidth - target.clientWidth);
            }
        };
    
        identificationRef.current!.addEventListener('scroll', handleScroll);
        tableValuesRef.current!.addEventListener('scroll', handleScroll);
    
        return () => {
            identificationRef.current!.removeEventListener('scroll', handleScroll);
            tableValuesRef.current!.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-md">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{name}</h2>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    {expanded ? 'Réduire' : 'Déplier'}
                </button>
            </div>

            <div className="">
                <h3 className="mb-4 font-semibold text-gray-900">Identification</h3>
                <ul className="overflow-x-auto items-center text-sm font-medium text-gray-900 bg-white  sm:flex" ref={identificationRef}>
                    {df.getHeader().map((header, index) => (
                        <li key={index} className={`px-4 ${selectedIdColumn === header ? 'bg-gray-100' : ''} border-gray border-b border-r border-t last:rounded-r-md first:rounded-l-md first:border-l`}>
                            <div className="flex items-center">
                                <input
                                    id={`horizontal-list-radio-${header}-${id}`}
                                    type="radio"
                                    value={header}
                                    name={`list-radio-${name}`}
                                    checked={selectedIdColumn === header}
                                    onChange={() => handleIdSelect(header)}
                                    className="hidden"
                                />
                                <label
                                    htmlFor={`horizontal-list-radio-${header}-${id}`}
                                    className={`py-3 text-sm font-medium text-gray-900 cursor-pointer`}
                                >
                                    {header}
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="overflow-x-auto" ref={tableValuesRef}>
                <table className="table-auto min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                        <tr>
                            {df.getHeader().map((header, index) => (
                                <th key={index} className="px-4 py-2">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {df.getValues().slice(0, rowsToShow).map((row, rowIndex) => (
                            <tr key={rowIndex} className={df.isExtraRow(rowIndex) ? 'bg-yellow-100' : ''}>
                                {Array.from(row.values()).map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={`px-4 py-2 ${df.isAnomaly(rowIndex, cellIndex.toString()) ? 'bg-red-500' : ''}`}
                                    >
                                        {df.getIdColumn() === df.getHeader()[cellIndex] ? (
                                            <span className="font-semibold">{cell}</span>
                                        ) : (
                                            cell
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
